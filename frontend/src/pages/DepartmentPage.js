// pages/DepartmentPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPredictions, updatePredictionStatus } from "../services/api";

const RISK_CFG = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.15)",  border:"rgba(239,68,68,0.4)"  },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.4)" },
  Low:    { color:"#22c55e", bg:"rgba(34,197,94,0.15)",  border:"rgba(34,197,94,0.4)"  },
};
const STATUS_CFG = {
  "Pending":     { color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
  "In Progress": { color:"#3b82f6", bg:"rgba(59,130,246,0.15)" },
  "Resolved":    { color:"#22c55e", bg:"rgba(34,197,94,0.15)"  },
};
const STATUSES = ["Pending", "In Progress", "Resolved"];

function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function DepartmentPage() {
  const navigate = useNavigate();
  const [data,        setData]        = useState({ stats:{}, predictions:[] });
  const [loading,     setLoading]     = useState(true);
  const [riskFilter,  setRiskFilter]  = useState("All");
  const [statusFilter,setStatusFilter]= useState("All");
  const [selected,    setSelected]    = useState(null);   // prediction being edited
  const [noteText,    setNoteText]    = useState("");
  const [newStatus,   setNewStatus]   = useState("");
  const [updating,    setUpdating]    = useState(false);
  const [updateMsg,   setUpdateMsg]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllPredictions(riskFilter === "All" ? null : riskFilter);
      setData(res);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [riskFilter]);

  useEffect(() => { load(); }, [load]);

  // Client-side status filter
  const filtered = data.predictions?.filter(p =>
    statusFilter === "All" || p.status === statusFilter
  ) || [];

  const openEdit = (pred) => {
    setSelected(pred);
    setNoteText(pred.department_note || "");
    setNewStatus(pred.status || "Pending");
    setUpdateMsg("");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await updatePredictionStatus(selected._id, newStatus, noteText);
      setUpdateMsg("✅ Status updated successfully!");
      setSelected(null);
      setTimeout(() => { setUpdateMsg(""); load(); }, 1200);
    } catch(e) {
      setUpdateMsg("❌ Update failed: " + e.message);
    } finally { setUpdating(false); }
  };

  const s = data.stats || {};

  return (
    <div className="app">
      <div className="bg-grid" /><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-icon">⬡</span>
          <div className="navbar-title-group">
            <span className="navbar-title">RoadSense AI</span>
            <span className="navbar-subtitle">Department Dashboard</span>
          </div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <button className="refresh-btn" onClick={load}>↻ Refresh</button>
          <button className="refresh-btn" onClick={() => navigate("/client")} style={{color:"#06b6d4",borderColor:"rgba(6,182,212,0.35)"}}>Client View</button>
          <button className="refresh-btn" onClick={() => navigate("/")}>← Home</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="hero" style={{marginBottom:36}}>
          <div className="hero-tag">Department Dashboard</div>
          <h1 className="hero-title">Road Reports <span className="hero-accent">Overview</span></h1>
          <p className="hero-desc">Monitor all submitted road failure reports and update maintenance status.</p>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-num">{s.total||0}</div><div className="stat-label">Total Reports</div></div>
          <div className="stat-card high"><div className="stat-num" style={{color:"#ef4444"}}>{s.high||0}</div><div className="stat-label">High Risk</div></div>
          <div className="stat-card med"><div className="stat-num" style={{color:"#f59e0b"}}>{s.medium||0}</div><div className="stat-label">Medium Risk</div></div>
          <div className="stat-card low"><div className="stat-num" style={{color:"#22c55e"}}>{s.low||0}</div><div className="stat-label">Low Risk</div></div>
          <div className="stat-card"><div className="stat-num" style={{color:"#f59e0b"}}>{s.pending||0}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-num" style={{color:"#3b82f6"}}>{s.in_progress||0}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-card"><div className="stat-num" style={{color:"#22c55e"}}>{s.resolved||0}</div><div className="stat-label">Resolved</div></div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="filter-group">
            <span className="filter-label">Risk:</span>
            {["All","High","Medium","Low"].map(r => (
              <button key={r} className={`filter-btn ${riskFilter===r?"active":""}`}
                style={riskFilter===r && r!=="All" ? {color:RISK_CFG[r]?.color, borderColor:RISK_CFG[r]?.color, background:RISK_CFG[r]?.bg} : {}}
                onClick={() => setRiskFilter(r)}>{r}</button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            {["All","Pending","In Progress","Resolved"].map(s => (
              <button key={s} className={`filter-btn ${statusFilter===s?"active":""}`}
                style={statusFilter===s && s!=="All" ? {color:STATUS_CFG[s]?.color, borderColor:STATUS_CFG[s]?.color, background:STATUS_CFG[s]?.bg} : {}}
                onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Success message */}
        {updateMsg && (
          <div className="update-toast" style={{color: updateMsg.startsWith("✅") ? "#22c55e" : "#ef4444"}}>
            {updateMsg}
          </div>
        )}

        {/* Table */}
        <div className="history-section" style={{marginTop:0}}>
          {loading ? (
            <div style={{textAlign:"center",padding:48,color:"#475569"}}>
              <div className="spinner large" style={{margin:"0 auto 12px"}} /> Loading reports…
            </div>
          ) : filtered.length === 0 ? (
            <div className="history-empty"><span>📋</span><p>No reports found for the selected filters.</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="history-table">
                <thead><tr>
                  <th>#</th><th>Location</th><th>Reported By</th>
                  <th>Risk</th><th>Probability</th>
                  <th>Road Age</th><th>Potholes</th><th>Cracks</th>
                  <th>Status</th><th>Note</th><th>Submitted</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const rc = RISK_CFG[row.risk] || RISK_CFG.Medium;
                    const sc = STATUS_CFG[row.status] || STATUS_CFG["Pending"];
                    return (
                      <tr key={row._id} className="table-row">
                        <td className="row-num">{i+1}</td>
                        <td style={{color:"#f1f5f9",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{row.location || "—"}</td>
                        <td>{row.reported_by || "Anonymous"}</td>
                        <td><span className="risk-badge" style={{color:rc.color,background:rc.bg,borderColor:rc.color}}>{row.risk}</span></td>
                        <td style={{color:rc.color,fontWeight:600}}>{row.probability?.toFixed(1)}%</td>
                        <td>{row.road_age} yr</td>
                        <td>{row.pothole_count}</td>
                        <td>{row.crack_length} m</td>
                        <td><span className="risk-badge" style={{color:sc.color,background:sc.bg,borderColor:sc.color,fontSize:9}}>{row.status}</span></td>
                        <td style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",color:"#64748b",fontSize:11}}>{row.department_note || "—"}</td>
                        <td className="timestamp-cell">{fmtTime(row.timestamp)}</td>
                        <td>
                          <button className="edit-btn" onClick={() => openEdit(row)}>Update</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Report Status</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-info-row">
              <div><span className="modal-info-label">Location</span><span className="modal-info-val">{selected.location || "Not specified"}</span></div>
              <div><span className="modal-info-label">Risk</span>
                <span className="risk-badge" style={{color:RISK_CFG[selected.risk]?.color,background:RISK_CFG[selected.risk]?.bg,borderColor:RISK_CFG[selected.risk]?.color}}>{selected.risk}</span>
              </div>
              <div><span className="modal-info-label">Probability</span><span className="modal-info-val" style={{color:"#06b6d4"}}>{selected.probability?.toFixed(1)}%</span></div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Update Status</label>
              <div className="status-btn-row">
                {STATUSES.map(s => (
                  <button key={s} className={`status-option-btn ${newStatus===s?"selected":""}`}
                    style={newStatus===s ? {color:STATUS_CFG[s].color, borderColor:STATUS_CFG[s].color, background:STATUS_CFG[s].bg} : {}}
                    onClick={() => setNewStatus(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Department Note</label>
              <textarea className="modal-textarea" rows={3}
                placeholder="Add maintenance notes, comments or instructions..."
                value={noteText} onChange={e => setNoteText(e.target.value)} />
            </div>

            <button className="predict-btn" onClick={handleUpdate} disabled={updating}>
              {updating ? <><span className="spinner" /> Updating…</> : "💾 Save Update"}
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>⬡ RoadSense AI — Department Dashboard</span>
        <span>FastAPI · MongoDB · Scikit-learn · React</span>
        <span>© 2025</span>
      </footer>
    </div>
  );
}
