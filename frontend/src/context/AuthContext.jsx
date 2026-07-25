/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const AuthContext = createContext(null);

/** authState: "pending" | "authenticated" | "unauthenticated" | "error" */
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState("pending");
  // { username, permissions? } — permissions is undefined until the
  // backend's GET /api/admin/verify starts returning one; see
  // PermissionsContext for how that's handled.
  const [admin, setAdmin] = useState(null);

  const verify = useCallback(async () => {
    setAuthState("pending");
    try {
      const { data } = await api.get(API_ENDPOINTS.adminVerify);
      setAdmin(data ?? null);
      setAuthState("authenticated");
    } catch (err) {
      setAdmin(null);
      setAuthState(err.statusCode === 401 ? "unauthenticated" : "error");
    }
  }, []);

  /* Run once on mount */
  useEffect(() => {
    queueMicrotask(() => verify());
  }, [verify]);

  /* api.js dispatches this event on every 401 response */
  useEffect(() => {
    const handler = () => {
      setAdmin(null);
      setAuthState("unauthenticated");
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  // Accepts optional admin data (e.g. the username just typed into the
  // login form) so the UI has something accurate to show immediately —
  // POST /api/admin/login itself returns no admin payload. The next
  // `verify()` (on reload, or wherever it's called again) overwrites
  // this with the server-confirmed value.
  const login = useCallback((adminData) => {
    setAdmin(adminData ?? null);
    setAuthState("authenticated");
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setAuthState("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ authState, admin, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
}
