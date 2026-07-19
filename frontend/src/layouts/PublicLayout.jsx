import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function PublicLayout() {
  return (
    <main>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Outlet />
      </div>
    </main>
  );
}
