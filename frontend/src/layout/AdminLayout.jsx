import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
      logout();
      navigate("/admin/login");
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="admin-shell">
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
          to="/admin/profile"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/admin/about"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          About
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
          to="/admin/categories"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/resume"
          className={({ isActive }) =>
            `admin-subnav__link${isActive ? " active" : ""}`
          }
        >
          Resume
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

      <main className="admin-shell__body">
        <div className="admin-shell__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
