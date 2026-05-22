import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";

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
    /*
     * admin-shell fills the full viewport independently.
     * No public <main>, <Sidebar>, or <Navbar> ever wraps this.
     */
    <div className="admin-shell">
      {/* ── Sticky top bar ───────────────────────────────────── */}
      <header className="admin-shell__topbar">
        <span className="admin-shell__brand">Admin Panel</span>
        <button
          className="btn btn--logout"
          onClick={handleLogout}
          type="button"
        >
          Sign out
        </button>
      </header>

      {/* ── Section sub-navigation ──────────────────────────── */}
      <nav className="admin-shell__subnav" aria-label="Admin sections">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/projects"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Projects
        </NavLink>
        <NavLink
          to="/admin/messages"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Messages
        </NavLink>
      </nav>

      {/* ── Scrollable content body ─────────────────────────── */}
      <main className="admin-shell__body">
        <div className="admin-shell__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
