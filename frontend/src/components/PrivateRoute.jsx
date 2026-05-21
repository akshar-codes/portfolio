import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

const AUTH_STATE = {
  PENDING: "pending",
  ALLOWED: "allowed",
  DENIED: "denied",
  ERROR: "error",
};

export default function PrivateRoute({ children }) {
  const [authState, setAuthState] = useState(AUTH_STATE.PENDING);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    api
      .get("/admin/verify")
      .then(() => {
        if (!cancelled) setAuthState(AUTH_STATE.ALLOWED);
      })
      .catch((err) => {
        if (cancelled) return;

        if (err.statusCode === 401) {
          setAuthState(AUTH_STATE.DENIED);
        } else {
          setAuthState(AUTH_STATE.ERROR);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === AUTH_STATE.PENDING) {
    return (
      <p style={{ padding: "40px", color: "var(--light-gray)" }}>
        Verifying session…
      </p>
    );
  }

  if (authState === AUTH_STATE.DENIED) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (authState === AUTH_STATE.ERROR) {
    return (
      <p style={{ padding: "40px", color: "var(--bittersweet-shimmer)" }}>
        Could not verify your session. Please check your connection and{" "}
        <button
          onClick={() => setAuthState(AUTH_STATE.PENDING)}
          style={{
            color: "var(--orange-yellow-crayola)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
        >
          try again
        </button>
        .
      </p>
    );
  }

  return children;
}
