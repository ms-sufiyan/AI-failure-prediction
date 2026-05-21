// components/HistoryTable.js
import React from "react";

const RISK_COLORS = {
  Low:    { color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.15)"  },
};

const fmt = (v, dec = 1) =>
  typeof v === "number" ? v.toFixed(dec) : v ?? "—";

const fmtTime = (ts) => {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return ts;
  }
};

const HistoryTable = ({ history, loading, onRefresh }) => {
  if (loading) {
    return (
      <section className="history-section">
        <div className="history-header">
          <h2 className="section-title">Prediction History</h2>
        </div>
        <div className="history-loading">
          <div className="spinner large" />
          <span>Loading records…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="history-section">
      <div className="history-header">
        <div>
          <h2 className="section-title">Prediction History</h2>
          <p className="section-desc">{history.length} recent records from MongoDB</p>
        </div>
        <button className="refresh-btn" onClick={onRefresh} title="Refresh history">
          ↻ Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <span>📋</span>
          <p>No predictions yet. Run your first prediction above!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Age (yr)</th>
                <th>Traffic</th>
                <th>HV %</th>
                <th>Rain (mm)</th>
                <th>Temp (°C)</th>
                <th>Cracks (m)</th>
                <th>Potholes</th>
                <th>SCI</th>
                <th>Maint (yr)</th>
                <th>Probability</th>
                <th>Risk</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => {
                const rc = RISK_COLORS[row.risk] || RISK_COLORS.Medium;
                return (
                  <tr key={row._id || idx} className="table-row">
                    <td className="row-num">{idx + 1}</td>
                    <td>{fmt(row.road_age, 0)}</td>
                    <td>{fmt(row.traffic_volume, 0)}</td>
                    <td>{fmt(row.heavy_vehicle_percentage)}</td>
                    <td>{fmt(row.rainfall, 0)}</td>
                    <td>{fmt(row.temperature)}</td>
                    <td>{fmt(row.crack_length)}</td>
                    <td>{fmt(row.pothole_count, 0)}</td>
                    <td>{fmt(row.surface_condition_index)}</td>
                    <td>{fmt(row.last_maintenance_years)}</td>
                    <td>
                      <div className="prob-cell">
                        <div
                          className="prob-mini-bar"
                          style={{
                            width: `${Math.min(row.probability, 100)}%`,
                            background: rc.color,
                          }}
                        />
                        <span style={{ color: rc.color }}>
                          {fmt(row.probability)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="risk-badge"
                        style={{ color: rc.color, background: rc.bg, borderColor: rc.color }}
                      >
                        {row.risk}
                      </span>
                    </td>
                    <td className="timestamp-cell">{fmtTime(row.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default HistoryTable;
