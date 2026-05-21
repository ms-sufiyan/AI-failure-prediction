// pages/ClientPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputForm, { PRESETS } from "../components/InputForm";
import ResultCard from "../components/ResultCard";
import { predictRoadFailure, fetchPredictionById, healthCheck } from "../services/api";

const DEFAULT_FORM = {
  Road_Age: 10, Traffic_Volume: 4000, Heavy_Vehicle_Percentage: 20,
  Rainfall: 800, Temperature: 28, Crack_Length: 8,
  Pothole_Count: 5, Surface_Condition_Index: 6.0, Last_Maintenance_Years: 2,
  location: "", reported_by: "",
};

const STATUS_CFG = {
  "Pending":     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: "🕐", desc: "Your report has been received. Department will review it shortly." },
  "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  icon: "🔧", desc: "Department is actively working on this road issue." },
  "Resolved":    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   icon: "✅", desc: "The road issue has been resolved by the department." },
};

export default function ClientPage() {
  const navigate = useNavigate();
  const [formData,      setFormData]      = useState(DEFAULT_FORM);
  const [result,        setResult]        = useState(null);
  const [predError,     setPredError]     = useState(null);
  const [predLoading,   setPredLoading]   = useState(false);
  const [predictionId,  setPredictionId]  = useState(null);
  const [statusData,    setStatusData]    = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [checkId,       setCheckId]       = useState("");
  const [dbConnected,   setDbConnected]   = useState(false);

  useEffect(() => {
    healthCheck().then(h => setDbConnected(h.database_connected)).catch(() => {});
  }, []);

  const handlePredict = async () => {
    setPredLoading(true); setResult(null); setPredError(null);
    try {
      const res = await predictRoadFailure(formData);
      setResult(res);
      if (res.prediction_id) setPredictionId(res.prediction_id);
    } catch (err) { setPredError(err.message); }
    finally { setPredLoading(false); }
  };

  const handleCheckStatus = async (idToCheck) => {
    const id = idToCheck || checkId;
    if (!id.trim()) return;
    setStatusLoading(true); setStatusData(null);
    try {
      const data = await fetchPredictionById(id.trim());
      setStatusData(data);
    } catch (err) { setStatusData({ error: err.message }); }
    finally { setStatusLoading(false); }
  };

  return (
    <div className="app">
      <div className="bg-grid" /><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-icon">⬡</span>
          <div className="navbar-title-group">
            <span className="navbar-title">RoadSense AI</span>
            <span className="navbar-subtitle">Client Portal</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <span className={`status-dot ${dbConnected ? "online" : "offline"}`} style={{width:8,height:8,borderRadius:"50%",background:dbConnected?"#22c55e":"#ef4444",boxShadow:`0 0 6px ${dbConnected?"#22c55e":"#ef4444"}`}} />
          <button className="refresh-btn" onClick={() => navigate("/")}>← Home</button>
          <button className="refresh-btn" style={{color:"#a78bfa",borderColor:"rgba(167,139,250,0.35)"}} onClick={() => navigate("/department")}>Department View</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="hero">
          <div className="hero-tag">Client Portal</div>
          <h1 className="hero-title">Report Road <span className="hero-accent">Condition</span></h1>
          <p className="hero-desc">Submit road condition data and receive an AI-powered failure risk assessment.</p>
        </header>

        {/* Extra fields: location + name */}
        <div className="extra-fields-row">
          <div className="extra-field">
            <label>📍 Road Location</label>
            <input type="text" placeholder="e.g. NH-44, Chennai" value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})} className="text-input" />
          </div>
          <div className="extra-field">
            <label>👤 Reported By</label>
            <input type="text" placeholder="Your name (optional)" value={formData.reported_by}
              onChange={e => setFormData({...formData, reported_by: e.target.value})} className="text-input" />
          </div>
        </div>

        <div className="layout-columns">
          <div className="col-form">
            <InputForm formData={formData} onChange={setFormData}
              onPreset={v => { setFormData({...v, location: formData.location, reported_by: formData.reported_by}); setResult(null); setPredError(null); }}
              onPredict={handlePredict} loading={predLoading} />
          </div>
          <div className="col-result">
            <div className="result-sticky">
              <div className="result-panel-header"><span>📡</span> Prediction Output</div>
              {!result && !predError && (
                <div className="result-placeholder">
                  <div className="placeholder-icon">⬡</div>
                  <p>Configure road parameters and click<br /><strong>Run Failure Prediction</strong></p>
                </div>
              )}
              <ResultCard result={result} error={predError} />

              {/* Show prediction ID after submit */}
              {predictionId && (
                <div className="id-card">
                  <div className="id-card-title">📋 Your Report ID</div>
                  <div className="id-value">{predictionId}</div>
                  <p className="id-hint">Save this ID to check your report status later</p>
                  <button className="refresh-btn" style={{width:"100%",marginTop:8,justifyContent:"center"}}
                    onClick={() => handleCheckStatus(predictionId)}>
                    Check Status Now →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Checker */}
        <section className="status-checker-section">
          <div className="section-header">
            <h2 className="section-title">🔍 Check Report Status</h2>
            <p className="section-desc">Enter your Report ID to see the current status from the department</p>
          </div>
          <div className="status-input-row">
            <input type="text" placeholder="Paste your Report ID here..."
              value={checkId} onChange={e => setCheckId(e.target.value)}
              className="text-input" style={{flex:1}}
              onKeyDown={e => e.key === "Enter" && handleCheckStatus()} />
            <button className="predict-btn" style={{width:"auto",padding:"0 28px"}}
              onClick={() => handleCheckStatus()} disabled={statusLoading}>
              {statusLoading ? <span className="spinner" /> : "Check Status"}
            </button>
          </div>

          {statusData && (
            statusData.error ? (
              <div className="status-result-card" style={{borderColor:"rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.07)"}}>
                <p style={{color:"#ef4444"}}>❌ {statusData.error}</p>
              </div>
            ) : (
              <div className="status-result-card" style={{
                borderColor: STATUS_CFG[statusData.status]?.border || "rgba(255,255,255,0.1)",
                background: STATUS_CFG[statusData.status]?.bg || "rgba(255,255,255,0.04)"
              }}>
                <div className="status-result-header">
                  <div>
                    <div className="status-result-label">Current Status</div>
                    <div className="status-result-value" style={{color: STATUS_CFG[statusData.status]?.color}}>
                      {STATUS_CFG[statusData.status]?.icon} {statusData.status}
                    </div>
                  </div>
                  <div>
                    <div className="status-result-label">Risk Level</div>
                    <div className="status-result-value" style={{color: statusData.risk==="High"?"#ef4444":statusData.risk==="Medium"?"#f59e0b":"#22c55e"}}>
                      {statusData.risk}
                    </div>
                  </div>
                  <div>
                    <div className="status-result-label">Probability</div>
                    <div className="status-result-value" style={{color:"#06b6d4"}}>{statusData.probability?.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="status-result-label">Location</div>
                    <div className="status-result-value" style={{color:"#94a3b8",fontSize:13}}>{statusData.location || "Not specified"}</div>
                  </div>
                </div>

                <div className="status-desc-box" style={{borderColor: STATUS_CFG[statusData.status]?.color}}>
                  {STATUS_CFG[statusData.status]?.desc}
                </div>

                {statusData.department_note && (
                  <div className="dept-note-box">
                    <span className="dept-note-label">💬 Department Note:</span>
                    <p>{statusData.department_note}</p>
                  </div>
                )}

                {statusData.status_updated_at && (
                  <div className="status-time">
                    Last updated: {new Date(statusData.status_updated_at).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            )
          )}
        </section>
      </main>

      <footer className="footer">
        <span>⬡ RoadSense AI — Client Portal</span>
        <span>FastAPI · MongoDB · Scikit-learn · React</span>
        <span>© 2025</span>
      </footer>
    </div>
  );
}
