// App.js — Route between Client and Department pages
import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import DepartmentPage from "./pages/DepartmentPage";
import "./styles/App.css";

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="landing-wrap">
        <div className="landing-tag">ML-Powered Analysis</div>
        <h1 className="hero-title">RoadSense <span className="hero-accent">AI</span></h1>
        <p className="hero-desc">Road Infrastructure Failure Prediction System</p>
        <div className="landing-cards">
          <div className="landing-card" onClick={() => navigate("/client")}>
            <div className="lcard-icon">🚗</div>
            <div className="lcard-title">Client Portal</div>
            <div className="lcard-desc">Submit road condition reports and track your prediction status</div>
            <div className="lcard-btn">Enter as Client →</div>
          </div>
          <div className="landing-card department" onClick={() => navigate("/department")}>
            <div className="lcard-icon">🏛️</div>
            <div className="lcard-title">Department Dashboard</div>
            <div className="lcard-desc">View all reports, update status and add maintenance notes</div>
            <div className="lcard-btn">Enter as Department →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/department" element={<DepartmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
