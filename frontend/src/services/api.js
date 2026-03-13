/**
 * NovaRescue AI - API Service
 * Handles all communication with the FastAPI backend
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes for long analyses
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Unknown error occurred";
    console.error(`[API Error] ${message}`);
    return Promise.reject(new Error(message));
  }
);

export const healthApi = {
  check: () => api.get("/api/health"),
  detailed: () => api.get("/api/health/detailed"),
};

export const analysisApi = {
  /**
   * Analyze disaster from text description
   */
  analyzeText: (payload) => api.post("/api/analyze/text", payload),

  /**
   * Analyze disaster from image upload
   */
  analyzeImage: (formData) =>
    api.post("/api/analyze/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Analyze disaster from voice recording
   */
  analyzeVoice: (formData) =>
    api.post("/api/analyze/voice", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Download incident PDF report
   */
  downloadReport: async (analysisData) => {
    const response = await api.post("/api/report/download", analysisData, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `NovaRescue-${analysisData.incident_id || "report"}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
