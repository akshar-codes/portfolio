import { Outlet, Link } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin">
      <header className="admin-header">
        <h2 className="h2 article-title">Admin Panel</h2>
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
