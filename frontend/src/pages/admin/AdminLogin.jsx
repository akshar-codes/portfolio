import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/client";
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
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState(() =>
    new URLSearchParams(window.location.search).get("auth") === "otp-required"
      ? "otp"
      : "primary",
  );
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
    if (status === "otp-required") {
      toast.success("Google sign-in verified. Enter the email code to continue.");
      window.history.replaceState({}, "", location.pathname);
    }
    if (status === "otp-failed")
      toast.error("Could not send the verification code. Please try signing in again.");
  }, [location.pathname, location.search]);

  const loginWithPassword = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password)
      return toast.error("Enter your admin email and password.");
    setLoading(true);
    try {
      const { envelope } = await api.post(API_ENDPOINTS.adminPasswordLogin, {
        email: email.trim(),
        password,
      });
      setStage("otp");
      toast.success(envelope?.message ?? "Check your email for a verification code.");
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
      await api.post(API_ENDPOINTS.adminOtpVerify, { code });
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
          <div className="admin-login-card__logo" aria-hidden="true">🔐</div>
          <h1 className="admin-login-card__title">Admin Login</h1>
          <p className="admin-login-card__sub">
            Sign in with Google or your admin password. Email verification is required either way.
          </p>
        </div>
        <div className="admin-divider" />

        {stage === "otp" ? (
          <form className="admin-form" onSubmit={verifyCode}>
            <p className="admin-login-card__sub">
              Enter the 6-digit code sent to the configured admin email. The code expires in 10 minutes.
            </p>
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
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? "Please wait…" : "Verify code and sign in"}
            </button>
            <button
              type="button"
              className="btn btn--block"
              style={{ marginTop: 8 }}
              disabled={loading}
              onClick={() => {
                setStage("primary");
                setCode("");
                setPassword("");
              }}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <>
            <a
              className="btn btn--primary btn--block"
              href={`${API_BASE_URL.replace(/\/$/, "")}/admin/login/google`}
              style={{ padding: "13px 20px", fontSize: 14, textAlign: "center", textDecoration: "none" }}
            >
              Continue with Google
            </a>
            <div className="admin-divider" />
            <p className="admin-login-card__sub">
              Or enter your admin email and password. A verification code will be sent after your password is accepted.
            </p>
            <form className="admin-form" onSubmit={loginWithPassword}>
              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="admin-email">Admin email</label>
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                {loading ? "Please wait…" : "Continue with password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
