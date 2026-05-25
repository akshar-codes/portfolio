import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Layout() {
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
