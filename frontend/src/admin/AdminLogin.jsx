import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname ?? "/admin/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/admin/login", form);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        {/* Logo + heading */}
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

        {/* Form */}
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

          {error && (
            <div className="admin-form__error" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

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
