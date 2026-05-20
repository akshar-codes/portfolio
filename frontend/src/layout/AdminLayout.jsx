import { Outlet, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
      navigate("/admin/login");
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="admin">
      <header
        className="admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="h2 article-title">Admin Panel</h2>

        <button
          onClick={handleLogout}
          className="danger-btn"
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </header>

      <nav className="admin-actions">
        <Link to="/admin/dashboard" className="admin-card">
          <h3>Dashboard</h3>
          <p>Overview</p>
        </Link>

        <Link to="/admin/projects" className="admin-card">
          <h3>Manage Projects</h3>
          <p>Add or delete projects</p>
        </Link>

        <Link to="/admin/messages" className="admin-card">
          <h3>Messages</h3>
          <p>View contact submissions</p>
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
