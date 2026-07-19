import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function PublicLayout() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
