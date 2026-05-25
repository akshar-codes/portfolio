import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* pending | authenticated | unauthenticated | error */
  const [authState, setAuthState] = useState("pending");

  const verify = useCallback(async () => {
    setAuthState("pending");
    try {
      await api.get("/admin/verify");
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
