import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import About from "./pages/About";
import Resume from "./pages/Resume";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";

import PrivateRoute from "./components/PrivateRoute";

const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const ManageProjects = lazy(() => import("./admin/ManageProjects"));
const AddProject = lazy(() => import("./admin/AddProject"));
const Messages = lazy(() => import("./admin/Messages"));

function AdminFallback() {
  return (
    <p style={{ padding: "40px", color: "var(--light-gray)" }}>Loading…</p>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* ── Public routes ───────────────────────────────────────── */}
          <Route path="/" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout />
                </Suspense>
              </PrivateRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />

            <Route
              path="projects"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <ManageProjects />
                </Suspense>
              }
            />

            <Route
              path="projects/new"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AddProject />
                </Suspense>
              }
            />

            <Route
              path="messages"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Messages />
                </Suspense>
              }
            />
          </Route>

          {/* ── 404 ─────────────────────────────────────────────────── */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
