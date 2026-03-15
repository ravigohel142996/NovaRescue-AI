/**
 * NovaRescue AI - API Service
 * Handles all communication with the FastAPI backend
 */

import axios from "axios";

const LOCAL_API_URL = "http://localhost:8000";

function resolveBaseUrl() {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  if (typeof window === "undefined") {
    return LOCAL_API_URL;
  }

  const { hostname, origin } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // Local dev: React app runs on :3000 and backend on :8000.
  // Deployed env: frontend and backend are usually served under the same origin.
  return isLocalhost ? LOCAL_API_URL : origin;
}

const BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes for long analyses
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const statusCode = error.response?.status;
    const message =
      error.response?.data?.detail ||
      (isNetworkError
        ? "Network Error: Unable to reach backend API. Check API URL/CORS/deployment routing."
        : `API request failed with status ${statusCode}`) ||
      "Unknown error occurred";
    console.error(`[API Error] ${message}`);
    const normalizedError = new Error(message);
    normalizedError.status = statusCode;
    normalizedError.isNetworkError = isNetworkError;
    return Promise.reject(normalizedError);
  }
);

export const healthApi = {
  check: () => api.get("/api/health"),
  detailed: () => api.get("/api/health/detailed"),
};

export const analysisApi = {
  /**
   * Analyze disaster from text description — runs four agents sequentially
   * with realistic delays so the UI can animate IDLE → RUNNING → COMPLETED.
   * Always uses simulation mode (no AWS credentials required).
   */
  analyzeDisaster: (payload) => api.post("/api/analyze-disaster", payload),

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
