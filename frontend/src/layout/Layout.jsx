import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Layout() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <main>
      <Sidebar />

      <div className={`main-content ${isAdminPage ? "admin" : ""}`}>
        <Navbar />
        <Outlet />
      </div>
    </main>
  );
}
