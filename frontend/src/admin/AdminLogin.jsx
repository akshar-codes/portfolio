import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
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

      navigate("/admin/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait 15 minutes.");
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="admin active">
      <header>
        <h2 className="h2 article-title">Admin Login</h2>
      </header>

      <form onSubmit={handleLogin} className="form admin-form">
        <div className="input-wrapper">
          <input
            type="text"
            name="username"
            className="form-input"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Inline error — replaces window.alert() from previous version */}
        {error && (
          <p
            style={{
              color: "var(--bittersweet-shimmer)",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </article>
  );
}
