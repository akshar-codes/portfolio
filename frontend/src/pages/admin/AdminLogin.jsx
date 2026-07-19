import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname ?? ROUTES.adminDashboard;

  const { authState, login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authState === "authenticated") {
      navigate(dest, { replace: true });
    }
  }, [authState, navigate, dest]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.adminLogin, form);
      login();
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't flash the form while an auth check is still pending
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
          <h2 className="admin-login-card__title">Admin Login</h2>
          <p className="admin-login-card__sub">
            Sign in to manage your portfolio
          </p>
        </div>

        <div className="admin-divider" />

        <form className="admin-form" onSubmit={handleLogin} noValidate>
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            style={{ padding: "13px 20px", fontSize: 14 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
