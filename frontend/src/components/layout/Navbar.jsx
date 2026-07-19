import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <NavLink
            to={ROUTES.home}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            About
          </NavLink>
        </li>

        <li className="navbar-item">
          <NavLink
            to={ROUTES.resume}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Resume
          </NavLink>
        </li>

        <li className="navbar-item">
          <NavLink
            to={ROUTES.portfolio}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Portfolio
          </NavLink>
        </li>

        <li className="navbar-item">
          <NavLink
            to={ROUTES.contact}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
