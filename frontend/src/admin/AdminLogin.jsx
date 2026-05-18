import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/admin/login", form);

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Try again later.");
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
            required
          />
        </div>

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </article>
  );
}
