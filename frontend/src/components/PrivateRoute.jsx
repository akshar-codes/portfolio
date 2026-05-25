import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { authState, verify } = useAuth();
  const location = useLocation();

  if (authState === "pending") {
    return (
      <p style={{ padding: "40px", color: "var(--light-gray)" }}>
        Verifying session…
      </p>
    );
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (authState === "error") {
    return (
      <p style={{ padding: "40px", color: "var(--bittersweet-shimmer)" }}>
        Could not verify your session. Please check your connection and{" "}
        <button
          onClick={verify}
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
