import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import { API_BASE_URL } from "../../config/env.js";
import { useAuth } from "../../hooks/useAuth";
import { useAdminStyles } from "../../hooks/useAdminStyles";
import { ROUTES } from "../../constants/routes";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

export default function AdminLogin() {
  useAdminStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname ?? ROUTES.adminDashboard;
  const { authState, login } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authState === "authenticated") navigate(dest, { replace: true });
  }, [authState, navigate, dest]);

  useEffect(() => {
    const status = new URLSearchParams(location.search).get("auth");
    if (status === "google-denied")
      toast.error("Google sign-in was not authorized for the admin account.");
    if (status === "google-unavailable")
      toast.error("Google sign-in is not configured on the server.");
    if (status === "google-success") {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.pathname, location.search]);

  const requestCode = async (event) => {
    event.preventDefault();
    if (!email.trim()) return toast.error("Enter your admin email address.");
    setLoading(true);
    try {
      const { envelope } = await api.post(API_ENDPOINTS.adminOtpRequest, {
        email,
      });
      setCodeSent(true);
      toast.success(
        envelope?.message ?? "Check your email for a sign-in code.",
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code))
      return toast.error("Enter the 6-digit code from your email.");
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.adminOtpVerify, { email, code });
      login();
      navigate(dest, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authState === "pending" || authState === "authenticated") {
    return (
      <div className="admin-login-wrap">
        <div className="admin-shell__loading">
          <div className="a-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-card__header">
          <div className="admin-login-card__logo" aria-hidden="true">
            🔐
          </div>
          <h1 className="admin-login-card__title">Admin Login</h1>
          <p className="admin-login-card__sub">
            Only the configured admin email can sign in. Registration is disabled.
          </p>
        </div>
        <div className="admin-divider" />

        <a
          className="btn btn--primary btn--block"
          href={`${API_BASE_URL.replace(/\/$/, "")}/admin/login/google`}
          style={{
            padding: "13px 20px",
            fontSize: 14,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Continue with Google
        </a>

        <div className="admin-divider" />
        <form
          className="admin-form"
          onSubmit={codeSent ? verifyCode : requestCode}
        >
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="admin-email">
              Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="Enter your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={loading || codeSent}
            />
          </div>
          {codeSent && (
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="admin-code">
                Email verification code
              </label>
              <input
                id="admin-code"
                type="text"
                className="form-input"
                placeholder="6-digit code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="btn btn--primary btn--block"
            style={{ padding: "13px 20px", fontSize: 14 }}
            disabled={loading}
          >
            {loading
              ? "Please wait…"
              : codeSent
                ? "Verify code and sign in"
                : "Send sign-in code"}
          </button>
          {codeSent && (
            <button
              type="button"
              className="btn btn--block"
              style={{ marginTop: 8 }}
              disabled={loading}
              onClick={() => {
                setCodeSent(false);
                setCode("");
              }}
            >
              Use another email
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
