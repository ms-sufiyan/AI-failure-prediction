// components/Navbar.js
import React from "react";

const Navbar = ({ dbConnected }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">⬡</span>
        <div className="navbar-title-group">
          <span className="navbar-title">RoadSense AI</span>
          <span className="navbar-subtitle">Infrastructure Failure Prediction System</span>
        </div>
      </div>
      <div className="navbar-status">
        <span className={`status-dot ${dbConnected ? "online" : "offline"}`} />
        <span className="status-text">
          {dbConnected ? "System Online" : "DB Offline"}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
