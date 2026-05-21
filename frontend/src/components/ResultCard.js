// components/ResultCard.js
import React, { useEffect, useRef } from "react";

const RISK_CONFIG = {
  Low: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.35)",
    glow: "rgba(34,197,94,0.25)",
    label: "LOW RISK",
    emoji: "✅",
    desc: "Road is in good condition. Routine monitoring recommended.",
    icon: "🛡️",
  },
  Medium: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.35)",
    glow: "rgba(245,158,11,0.25)",
    label: "MEDIUM RISK",
    emoji: "⚠️",
    desc: "Moderate degradation detected. Schedule inspection within 3 months.",
    icon: "🔍",
  },
  High: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.35)",
    glow: "rgba(239,68,68,0.3)",
    label: "HIGH RISK",
    emoji: "🚨",
    desc: "Critical failure risk! Immediate maintenance intervention required.",
    icon: "⚡",
  },
};

const ResultCard = ({ result, error }) => {
  const barRef = useRef(null);

  useEffect(() => {
    if (result && barRef.current) {
      // Animate bar from 0 → probability
      barRef.current.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (barRef.current)
            barRef.current.style.width = `${result.probability}%`;
        }, 80);
      });
    }
  }, [result]);

  if (error) {
    return (
      <div className="result-card error-card">
        <div className="result-error-icon">⚠️</div>
        <div className="result-error-title">Prediction Failed</div>
        <div className="result-error-msg">{error}</div>
        <div className="result-error-hint">
          Make sure the backend is running and the model is trained.
        </div>
      </div>
    );
  }

  if (!result) return null;

  const cfg = RISK_CONFIG[result.risk] || RISK_CONFIG.Medium;

  return (
    <div
      className="result-card"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        boxShadow: `0 0 40px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Top badge */}
      <div className="result-badge" style={{ color: cfg.color, borderColor: cfg.border }}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      {/* Probability display */}
      <div className="result-prob-wrap">
        <div className="result-prob-number" style={{ color: cfg.color }}>
          {result.probability.toFixed(1)}
          <span className="result-prob-pct">%</span>
        </div>
        <div className="result-prob-label">Failure Probability</div>
      </div>

      {/* Animated progress bar */}
      <div className="result-bar-track">
        <div
          ref={barRef}
          className="result-bar-fill"
          style={{
            background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
            boxShadow: `0 0 12px ${cfg.glow}`,
            transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <div className="result-bar-markers">
          <span>0%</span>
          <span style={{ color: "#22c55e" }}>Low</span>
          <span style={{ color: "#f59e0b" }}>Medium</span>
          <span style={{ color: "#ef4444" }}>High</span>
          <span>100%</span>
        </div>
      </div>

      {/* Risk zones indicator */}
      <div className="result-zones">
        <div className="zone zone-low" style={{ opacity: result.risk === "Low" ? 1 : 0.3 }}>
          ● Low (&lt;40%)
        </div>
        <div className="zone zone-med" style={{ opacity: result.risk === "Medium" ? 1 : 0.3 }}>
          ● Medium (40–70%)
        </div>
        <div className="zone zone-high" style={{ opacity: result.risk === "High" ? 1 : 0.3 }}>
          ● High (&gt;70%)
        </div>
      </div>

      {/* Message */}
      <div className="result-message" style={{ borderColor: cfg.border }}>
        <span>{cfg.emoji}</span>
        <p>{result.message || cfg.desc}</p>
      </div>
    </div>
  );
};

export default ResultCard;
