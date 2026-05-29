import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
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
const ManageCategories = lazy(() => import("./admin/ManageCategories"));
const Messages = lazy(() => import("./admin/Messages"));

const Fallback = () => (
  <div className="admin-shell__loading">
    <div className="a-spinner" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          {/* Single Toaster instance for the entire app.*/}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: "var(--ff-poppins)", fontSize: "14px" },
              duration: 4000,
            }}
          />

          <Routes>
            {/* ── PUBLIC ─────────────────────────────────────────── */}
            <Route element={<Layout />}>
              <Route path="/" element={<About />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<ErrorPage />} />
            </Route>

            {/* ── ADMIN LOGIN ────────────────────────────────────── */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<Fallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />

            {/* ── PROTECTED ADMIN ────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Suspense fallback={<Fallback />}>
                    <AdminLayout />
                  </Suspense>
                </PrivateRoute>
              }
            >
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<Fallback />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="projects"
                element={
                  <Suspense fallback={<Fallback />}>
                    <ManageProjects />
                  </Suspense>
                }
              />
              <Route
                path="projects/new"
                element={
                  <Suspense fallback={<Fallback />}>
                    <AddProject />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<Fallback />}>
                    <ManageCategories />
                  </Suspense>
                }
              />
              <Route
                path="messages"
                element={
                  <Suspense fallback={<Fallback />}>
                    <Messages />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
