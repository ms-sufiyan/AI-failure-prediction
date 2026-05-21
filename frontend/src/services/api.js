// services/api.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export const predictRoadFailure   = (data)              => api.post("/predict", data).then(r => r.data);
export const fetchAllPredictions  = (risk = null)       => api.get(`/predictions${risk && risk !== "All" ? `?risk=${risk}` : ""}`).then(r => r.data);
export const fetchPredictionById  = (id)                => api.get(`/predictions/${id}`).then(r => r.data);
export const updatePredictionStatus = (id, status, note) => api.put(`/predictions/${id}/status`, { status, department_note: note }).then(r => r.data);
export const healthCheck          = ()                  => api.get("/health").then(r => r.data);

export default api;
