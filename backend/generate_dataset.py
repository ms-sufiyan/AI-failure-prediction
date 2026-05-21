"""
Dataset generator for Road Infrastructure Failure Prediction.
Uses a logical risk formula based on domain knowledge.
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 900

road_age = np.random.randint(1, 40, N)
traffic_volume = np.random.randint(500, 15000, N)
heavy_vehicle_pct = np.random.uniform(5, 60, N)
rainfall = np.random.uniform(200, 2500, N)
temperature = np.random.uniform(-5, 50, N)
crack_length = np.random.uniform(0, 50, N)
pothole_count = np.random.randint(0, 30, N)
surface_condition_index = np.random.uniform(1, 10, N)
last_maintenance_years = np.random.uniform(0, 15, N)

# Logical risk score (domain-based)
risk_score = (
    (road_age / 40) * 0.20 +
    (traffic_volume / 15000) * 0.15 +
    (heavy_vehicle_pct / 60) * 0.15 +
    (rainfall / 2500) * 0.08 +
    (np.abs(temperature - 20) / 30) * 0.05 +
    (crack_length / 50) * 0.18 +
    (pothole_count / 30) * 0.10 +
    ((10 - surface_condition_index) / 9) * 0.06 +
    (last_maintenance_years / 15) * 0.03
)

noise = np.random.normal(0, 0.05, N)
probability = np.clip(risk_score + noise, 0, 1)
failure = (probability > 0.50).astype(int)

df = pd.DataFrame({
    'Road_Age': road_age,
    'Traffic_Volume': traffic_volume,
    'Heavy_Vehicle_Percentage': heavy_vehicle_pct.round(2),
    'Rainfall': rainfall.round(2),
    'Temperature': temperature.round(2),
    'Crack_Length': crack_length.round(2),
    'Pothole_Count': pothole_count,
    'Surface_Condition_Index': surface_condition_index.round(2),
    'Last_Maintenance_Years': last_maintenance_years.round(2),
    'Failure': failure
})

df.to_csv('data/dataset.csv', index=False)
print(f"Dataset generated: {len(df)} rows, {df['Failure'].sum()} failures ({df['Failure'].mean()*100:.1f}%)")
