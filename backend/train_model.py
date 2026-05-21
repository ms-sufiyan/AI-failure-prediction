"""
train_model.py
Trains a Logistic Regression model for Road Infrastructure Failure Prediction.
Saves model + scaler using pickle.

Run:
    python train_model.py
"""
import pickle
import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, roc_auc_score, confusion_matrix
)

from data_preprocessing import load_and_preprocess

# ── Paths ────────────────────────────────────────────────────────────────────
DATA_PATH   = "data/dataset.csv"
MODEL_PATH  = "models/model.pkl"
SCALER_PATH = "models/scaler.pkl"


def train():
    print("=" * 55)
    print("  Road Infrastructure Failure Prediction — Training")
    print("=" * 55)

    # 1. Generate dataset if not present
    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating …")
        import generate_dataset  # noqa: F401

    # 2. Load + preprocess
    X_train, X_test, y_train, y_test, scaler = load_and_preprocess(DATA_PATH)

    # 3. Train Logistic Regression
    print("\nTraining Logistic Regression …")
    model = LogisticRegression(
        max_iter=1000,
        C=1.0,
        solver='lbfgs',
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)

    # 4. Evaluate
    y_pred       = model.predict(X_test)
    y_prob       = model.predict_proba(X_test)[:, 1]
    accuracy     = accuracy_score(y_test, y_pred)
    roc_auc      = roc_auc_score(y_test, y_prob)

    print(f"\n{'─'*45}")
    print(f"  Accuracy  : {accuracy*100:.2f}%")
    print(f"  ROC-AUC   : {roc_auc:.4f}")
    print(f"{'─'*45}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Failure", "Failure"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # 5. Save model + scaler
    os.makedirs("models", exist_ok=True)
    with open(MODEL_PATH,  "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    print(f"\n✅  Model saved  → {MODEL_PATH}")
    print(f"✅  Scaler saved → {SCALER_PATH}")
    print("=" * 55)


if __name__ == "__main__":
    train()
