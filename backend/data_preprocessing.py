"""
data_preprocessing.py
Handles all data preprocessing for the Road Failure Prediction system.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split


FEATURE_COLUMNS = [
    'Road_Age', 'Traffic_Volume', 'Heavy_Vehicle_Percentage',
    'Rainfall', 'Temperature', 'Crack_Length', 'Pothole_Count',
    'Surface_Condition_Index', 'Last_Maintenance_Years'
]
TARGET_COLUMN = 'Failure'


def load_and_preprocess(csv_path: str):
    """
    Load dataset from CSV and return train/test splits with scaler.
    Returns: X_train_scaled, X_test_scaled, y_train, y_test, scaler
    """
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records from {csv_path}")

    # Drop rows with missing values
    df = df.dropna()

    # Clip outliers to realistic ranges
    df['Road_Age'] = df['Road_Age'].clip(0, 60)
    df['Traffic_Volume'] = df['Traffic_Volume'].clip(0, 50000)
    df['Heavy_Vehicle_Percentage'] = df['Heavy_Vehicle_Percentage'].clip(0, 100)
    df['Surface_Condition_Index'] = df['Surface_Condition_Index'].clip(1, 10)
    df['Pothole_Count'] = df['Pothole_Count'].clip(0, 100)

    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"Failure rate (train): {y_train.mean()*100:.1f}%")

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


def preprocess_single(input_dict: dict, scaler: StandardScaler) -> np.ndarray:
    """
    Preprocess a single prediction input dict and return scaled array.
    """
    row = [input_dict[col] for col in FEATURE_COLUMNS]
    arr = np.array(row).reshape(1, -1)
    return scaler.transform(arr)
