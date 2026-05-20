import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function PrivateRoute({ children }) {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/admin/verify")
      .then(() => {
        if (!cancelled) setAuthState(true);
      })
      .catch(() => {
        if (!cancelled) setAuthState(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === null) {
    return null;
  }

  return authState ? children : <Navigate to="/admin/login" replace />;
}
