"""
database.py - MongoDB connection and CRUD helpers
Database : road_prediction_db
Collection: predictions
"""
import os
from datetime import datetime, timezone
from typing import List, Dict, Any

# Fix DNS on restricted networks
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']
except Exception:
    pass

from pymongo import MongoClient, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId

MONGO_URI  = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME    = "road_prediction_db"
COLLECTION = "predictions"

_client = None

def get_collection():
    global _client
    if _client is None:
        use_tls = "mongodb+srv" in MONGO_URI
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000, tls=use_tls)
        _client.admin.command("ping")
    return _client[DB_NAME][COLLECTION]

def save_prediction(data: dict) -> str:
    col = get_collection()
    record = {
        **data,
        "status": "Pending",
        "department_note": "",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status_updated_at": None,
    }
    result = col.insert_one(record)
    return str(result.inserted_id)

def fetch_all_predictions(limit: int = 100, risk_filter: str = None) -> List[Dict[str, Any]]:
    col = get_collection()
    query = {}
    if risk_filter and risk_filter != "All":
        query["risk"] = risk_filter
    cursor = col.find(query).sort("timestamp", DESCENDING).limit(limit)
    records = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records

def fetch_prediction_by_id(prediction_id: str):
    col = get_collection()
    try:
        doc = col.find_one({"_id": ObjectId(prediction_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        return None

def update_prediction_status(prediction_id: str, status: str, note: str = "") -> bool:
    col = get_collection()
    try:
        result = col.update_one(
            {"_id": ObjectId(prediction_id)},
            {"$set": {
                "status": status,
                "department_note": note,
                "status_updated_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
        return result.modified_count > 0
    except Exception:
        return False

def fetch_history(limit: int = 50) -> List[Dict[str, Any]]:
    col = get_collection()
    cursor = col.find({}).sort("timestamp", DESCENDING).limit(limit)
    records = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records

def is_connected() -> bool:
    try:
        get_collection()
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError):
        return False
