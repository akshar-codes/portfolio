import { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const AuthContext = createContext(null);

/** authState: "pending" | "authenticated" | "unauthenticated" | "error" */
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState("pending");

  const verify = useCallback(async () => {
    setAuthState("pending");
    try {
      await api.get(API_ENDPOINTS.adminVerify);
      setAuthState("authenticated");
    } catch (err) {
      setAuthState(err.statusCode === 401 ? "unauthenticated" : "error");
    }
  }, []);

  /* Run once on mount */
  useEffect(() => {
    verify();
  }, [verify]);

  /* api.js dispatches this event on every 401 response */
  useEffect(() => {
    const handler = () => setAuthState("unauthenticated");
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  const login = () => setAuthState("authenticated");
  const logout = () => setAuthState("unauthenticated");

  return (
    <AuthContext.Provider value={{ authState, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
}
