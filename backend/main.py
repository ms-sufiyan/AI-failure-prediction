"""
main.py - FastAPI app for Road Infrastructure Failure Prediction System
Endpoints:
  POST /predict              - Run ML prediction, save to MongoDB
  GET  /predictions          - Department: fetch all predictions with filters
  GET  /predictions/{id}     - Client: fetch single prediction status
  PUT  /predictions/{id}     - Department: update status + note
  GET  /health               - Health check
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import traceback

import predict as predictor
import database as db

app = FastAPI(
    title="Road Infrastructure Failure Prediction API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictionInput(BaseModel):
    Road_Age: float = Field(..., ge=0, le=100)
    Traffic_Volume: float = Field(..., ge=0, le=100000)
    Heavy_Vehicle_Percentage: float = Field(..., ge=0, le=100)
    Rainfall: float = Field(..., ge=0, le=5000)
    Temperature: float = Field(..., ge=-30, le=60)
    Crack_Length: float = Field(..., ge=0, le=200)
    Pothole_Count: int = Field(..., ge=0, le=200)
    Surface_Condition_Index: float = Field(..., ge=1, le=10)
    Last_Maintenance_Years: float = Field(..., ge=0, le=50)
    location: Optional[str] = ""
    reported_by: Optional[str] = "Anonymous"


class StatusUpdate(BaseModel):
    status: str = Field(..., description="Pending | In Progress | Resolved")
    department_note: Optional[str] = ""


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Road Infrastructure Failure Prediction API is running 🚗"}


@app.get("/health")
def health_check():
    import os
    model_ok = os.path.exists("models/model.pkl") and os.path.exists("models/scaler.pkl")
    db_ok = db.is_connected()
    return {
        "model_loaded": model_ok,
        "database_connected": db_ok,
        "status": "ok" if (model_ok and db_ok) else "degraded"
    }


@app.post("/predict")
def make_prediction(payload: PredictionInput):
    """Client submits road condition — runs ML and saves to MongoDB."""
    try:
        input_dict = {
            "Road_Age": payload.Road_Age,
            "Traffic_Volume": payload.Traffic_Volume,
            "Heavy_Vehicle_Percentage": payload.Heavy_Vehicle_Percentage,
            "Rainfall": payload.Rainfall,
            "Temperature": payload.Temperature,
            "Crack_Length": payload.Crack_Length,
            "Pothole_Count": payload.Pothole_Count,
            "Surface_Condition_Index": payload.Surface_Condition_Index,
            "Last_Maintenance_Years": payload.Last_Maintenance_Years,
        }

        result = predictor.predict(input_dict)
        probability = result["probability"]
        risk = result["risk"]

        messages = {
            "Low":    "Road is in good condition. Routine monitoring recommended.",
            "Medium": "Moderate risk detected. Schedule inspection within 3 months.",
            "High":   "High failure risk! Immediate maintenance required.",
        }

        prediction_id = None
        try:
            prediction_id = db.save_prediction({
                "road_age": payload.Road_Age,
                "traffic_volume": payload.Traffic_Volume,
                "heavy_vehicle_percentage": payload.Heavy_Vehicle_Percentage,
                "rainfall": payload.Rainfall,
                "temperature": payload.Temperature,
                "crack_length": payload.Crack_Length,
                "pothole_count": payload.Pothole_Count,
                "surface_condition_index": payload.Surface_Condition_Index,
                "last_maintenance_years": payload.Last_Maintenance_Years,
                "probability": probability,
                "risk": risk,
                "location": payload.location,
                "reported_by": payload.reported_by,
            })
        except Exception as db_err:
            print(f"[WARN] Could not save to MongoDB: {db_err}")

        return {
            "prediction_id": prediction_id,
            "probability": probability,
            "risk": risk,
            "message": messages[risk],
            "status": "Pending",
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/predictions")
def get_all_predictions(
    limit: int = Query(100, le=200),
    risk: Optional[str] = Query(None, description="Filter: Low | Medium | High | All")
):
    """Department dashboard — fetch all predictions with optional risk filter."""
    try:
        records = db.fetch_all_predictions(limit=limit, risk_filter=risk)
        # Stats summary
        total  = len(records)
        high   = sum(1 for r in records if r.get("risk") == "High")
        medium = sum(1 for r in records if r.get("risk") == "Medium")
        low    = sum(1 for r in records if r.get("risk") == "Low")
        pending    = sum(1 for r in records if r.get("status") == "Pending")
        inprogress = sum(1 for r in records if r.get("status") == "In Progress")
        resolved   = sum(1 for r in records if r.get("status") == "Resolved")
        return {
            "stats": {
                "total": total, "high": high, "medium": medium, "low": low,
                "pending": pending, "in_progress": inprogress, "resolved": resolved
            },
            "predictions": records
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/predictions/{prediction_id}")
def get_prediction_status(prediction_id: str):
    """Client checks the status of their submitted prediction."""
    try:
        doc = db.fetch_prediction_by_id(prediction_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Prediction not found")
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/predictions/{prediction_id}/status")
def update_status(prediction_id: str, payload: StatusUpdate):
    """Department updates the status and adds a note to a prediction."""
    valid_statuses = ["Pending", "In Progress", "Resolved"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
    try:
        success = db.update_prediction_status(prediction_id, payload.status, payload.department_note or "")
        if not success:
            raise HTTPException(status_code=404, detail="Prediction not found or not updated")
        return {"message": f"Status updated to '{payload.status}'", "prediction_id": prediction_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def get_history(limit: int = 50):
    try:
        records = db.fetch_history(limit=min(limit, 200))
        return {"count": len(records), "history": records}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")
