"""
predict.py
Handles model loading and inference for the Road Failure Prediction API.
"""
import pickle
import os
import numpy as np
from data_preprocessing import preprocess_single

MODEL_PATH  = "models/model.pkl"
SCALER_PATH = "models/scaler.pkl"

_model  = None
_scaler = None


def _load_artifacts():
    """Lazy-load model and scaler from disk (cached in module-level globals)."""
    global _model, _scaler
    if _model is None or _scaler is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(
                "Model or scaler not found. "
                "Please run `python train_model.py` first."
            )
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)


def get_risk_level(probability: float) -> str:
    """Map failure probability to a human-readable risk level."""
    if probability < 0.40:
        return "Low"
    elif probability < 0.70:
        return "Medium"
    return "High"


def predict(input_data: dict) -> dict:
    """
    Run prediction on a single road-condition input.

    Args:
        input_data: dict with keys matching FEATURE_COLUMNS in data_preprocessing.py

    Returns:
        dict with 'probability' (float 0-100) and 'risk' (str)
    """
    _load_artifacts()
    X_scaled  = preprocess_single(input_data, _scaler)
    prob_raw  = float(_model.predict_proba(X_scaled)[0][1])   # failure class
    probability = round(prob_raw * 100, 2)
    risk        = get_risk_level(prob_raw)
    return {"probability": probability, "risk": risk}
