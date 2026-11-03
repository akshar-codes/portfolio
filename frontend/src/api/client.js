import axios from "axios";
import { API_BASE_URL } from "../config/env.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10_000,
});

function normalizeError(error) {
  if (error._normalized) return error;
  error._normalized = true;

  if (error.code === "ECONNABORTED" || error.code === "ERR_CANCELED") {
    error.message = "Request timed out — please try again.";
    error.isTimeout = true;
    return error;
  }

  if (error.request && !error.response) {
    error.message =
      "Network error — please check your connection and try again.";
    error.isNetwork = true;
    return error;
  }

  if (error.response) {
    const { status, data } = error.response;
    error.statusCode = status;
    // Capture the machine-readable code so components can branch on it
    error.errorCode = data?.errorCode ?? null;

    if (data?.message && typeof data.message === "string") {
      error.message = data.message;
    }

    if (status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
  }

  return error;
}

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(normalizeError(error)),
);

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      response.envelope = body;
      response.data = body.data ?? null;
    }
    return response;
  },
  (error) => Promise.reject(normalizeError(error)),
);

export default api;
