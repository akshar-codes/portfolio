import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { GlobalLoadingProvider } from "./context/GlobalLoadingContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PrivateRoute from "./components/common/PrivateRoute";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import Resume from "./pages/public/Resume";
import Work from "./pages/public/Work";
import Contact from "./pages/public/Contact";
import { ROUTES } from "./constants/routes";

// Admin lazy loads
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const ProjectEditor = lazy(() => import("./pages/admin/ProjectEditor"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const ManageResume = lazy(() => import("./pages/admin/ManageResume"));
const ManageProfile = lazy(() => import("./pages/admin/ManageProfile"));
const ManageAbout = lazy(() => import("./pages/admin/ManageAbout"));
const ManageSiteSettings = lazy(() => import("./pages/admin/ManageSiteSettings"));
const ManageNavigation = lazy(() => import("./pages/admin/ManageNavigation"));
const ManageFooter = lazy(() => import("./pages/admin/ManageFooter"));
const ManageSeo = lazy(() => import("./pages/admin/ManageSeo"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AdminNotFound = lazy(() => import("./pages/NotFound"));

const Fallback = () => (
  <div className="admin-shell__loading">
    <div className="a-spinner" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ConfirmDialogProvider>
        <GlobalLoadingProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: { fontFamily: "var(--ff-poppins, Inter, sans-serif)", fontSize: "14px" },
                duration: 4000,
              }}
            />

            <Routes>
              {/* ── PUBLIC ─────────────────────────────────────────── */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/work" element={<Work />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

              {/* ── ADMIN LOGIN ────────────────────────────────────── */}
              <Route
                path={ROUTES.adminLogin}
                element={
                  <Suspense fallback={<Fallback />}>
                    <AdminLogin />
                  </Suspense>
                }
              />

              {/* ── PROTECTED ADMIN ────────────────────────────────── */}
              <Route
                path={ROUTES.adminRoot}
                element={
                  <PrivateRoute>
                    <PermissionsProvider>
                      <Suspense fallback={<Fallback />}>
                        <AdminLayout />
                      </Suspense>
                    </PermissionsProvider>
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
                  path="profile"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageProfile />
                    </Suspense>
                  }
                />
                <Route
                  path="about"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageAbout />
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
                      <ProjectEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="projects/:id/edit"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ProjectEditor />
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
                  path="resume"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageResume />
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
                <Route
                  path="navigation"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageNavigation />
                    </Suspense>
                  }
                />
                <Route
                  path="footer"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageFooter />
                    </Suspense>
                  }
                />
                <Route
                  path="seo"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageSeo />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageSiteSettings />
                    </Suspense>
                  }
                />
                <Route
                  path="unauthorized"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <Unauthorized />
                    </Suspense>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <AdminNotFound />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </GlobalLoadingProvider>
      </ConfirmDialogProvider>
    </ErrorBoundary>
  );
}
