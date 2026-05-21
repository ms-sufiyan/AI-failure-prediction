// components/InputForm.js
import React from "react";

// ── Preset scenarios ──────────────────────────────────────────────────────────
export const PRESETS = {
  low: {
    label: "Low Risk",
    emoji: "🟢",
    values: {
      Road_Age: 3,
      Traffic_Volume: 1200,
      Heavy_Vehicle_Percentage: 8,
      Rainfall: 400,
      Temperature: 22,
      Crack_Length: 2,
      Pothole_Count: 1,
      Surface_Condition_Index: 8.5,
      Last_Maintenance_Years: 0.5,
    },
  },
  medium: {
    label: "Medium Risk",
    emoji: "🟡",
    values: {
      Road_Age: 20,
      Traffic_Volume: 8000,
      Heavy_Vehicle_Percentage: 38,
      Rainfall: 1400,
      Temperature: 38,
      Crack_Length: 24,
      Pothole_Count: 14,
      Surface_Condition_Index: 4.5,
      Last_Maintenance_Years: 6,
    },
  },
  high: {
    label: "High Risk",
    emoji: "🔴",
    values: {
      Road_Age: 32,
      Traffic_Volume: 13000,
      Heavy_Vehicle_Percentage: 55,
      Rainfall: 2200,
      Temperature: 48,
      Crack_Length: 42,
      Pothole_Count: 26,
      Surface_Condition_Index: 2.0,
      Last_Maintenance_Years: 12,
    },
  },
};

// ── Field metadata ────────────────────────────────────────────────────────────
const FIELDS = [
  { key: "Road_Age",                  label: "Road Age",                    unit: "years",   min: 0,   max: 60,    step: 1,    icon: "🛣️" },
  { key: "Traffic_Volume",            label: "Daily Traffic Volume",         unit: "vehicles",min: 0,  max: 20000, step: 100,  icon: "🚗" },
  { key: "Heavy_Vehicle_Percentage",  label: "Heavy Vehicle %",             unit: "%",       min: 0,   max: 100,   step: 1,    icon: "🚛" },
  { key: "Rainfall",                  label: "Annual Rainfall",             unit: "mm",      min: 0,   max: 3000,  step: 10,   icon: "🌧️" },
  { key: "Temperature",               label: "Avg Temperature",             unit: "°C",      min: -10, max: 55,    step: 0.5,  icon: "🌡️" },
  { key: "Crack_Length",              label: "Total Crack Length",          unit: "m",       min: 0,   max: 100,   step: 0.5,  icon: "🕳️" },
  { key: "Pothole_Count",             label: "Pothole Count",               unit: "",        min: 0,   max: 60,    step: 1,    icon: "⚠️" },
  { key: "Surface_Condition_Index",   label: "Surface Condition Index",     unit: "/10",     min: 1,   max: 10,    step: 0.1,  icon: "📊" },
  { key: "Last_Maintenance_Years",    label: "Years Since Maintenance",     unit: "years",   min: 0,   max: 20,    step: 0.5,  icon: "🔧" },
];

// ── Component ─────────────────────────────────────────────────────────────────
const InputForm = ({ formData, onChange, onPreset, onPredict, loading }) => {
  const handleSlider = (key, value) => {
    onChange({ ...formData, [key]: parseFloat(value) });
  };

  return (
    <section className="input-section">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">Road Condition Parameters</h2>
        <p className="section-desc">Adjust values or load a preset scenario to evaluate road failure risk.</p>
      </div>

      {/* Preset Buttons */}
      <div className="preset-row">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            className={`preset-btn preset-${key}`}
            onClick={() => onPreset(preset.values)}
          >
            <span>{preset.emoji}</span>
            Load {preset.label} Values
          </button>
        ))}
      </div>

      {/* Slider Grid */}
      <div className="fields-grid">
        {FIELDS.map(({ key, label, unit, min, max, step, icon }) => {
          const val = formData[key] ?? min;
          // Compute fill % for visual track
          const pct = ((val - min) / (max - min)) * 100;
          return (
            <div key={key} className="field-card">
              <div className="field-header">
                <span className="field-icon">{icon}</span>
                <label className="field-label">{label}</label>
                <span className="field-value">
                  {typeof val === "number" ? val.toFixed(step < 1 ? 1 : 0) : val}
                  <span className="field-unit"> {unit}</span>
                </span>
              </div>
              <div className="slider-track-wrap">
                <div
                  className="slider-fill"
                  style={{ width: `${pct}%` }}
                />
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) => handleSlider(key, e.target.value)}
                  className="slider"
                />
              </div>
              <div className="slider-bounds">
                <span>{min}{unit === "%" ? "%" : ""}</span>
                <span>{max}{unit === "%" ? "%" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predict Button */}
      <button
        className={`predict-btn ${loading ? "loading" : ""}`}
        onClick={onPredict}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analysing Road Condition…
          </>
        ) : (
          <>
            <span>⬡</span> Run Failure Prediction
          </>
        )}
      </button>
    </section>
  );
};

export default InputForm;
