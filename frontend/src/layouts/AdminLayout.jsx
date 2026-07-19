import { Outlet, NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const SUBNAV_LINKS = [
  { to: ROUTES.adminDashboard, label: "Dashboard" },
  { to: ROUTES.adminProfile, label: "Profile" },
  { to: ROUTES.adminAbout, label: "About" },
  { to: ROUTES.adminProjects, label: "Projects" },
  { to: ROUTES.adminCategories, label: "Categories" },
  { to: ROUTES.adminResume, label: "Resume" },
  { to: ROUTES.adminMessages, label: "Messages" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.adminLogout);
      logout();
      navigate(ROUTES.adminLogin);
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
        {SUBNAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `admin-subnav__link${isActive ? " active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="admin-shell__body">
        <div className="admin-shell__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
