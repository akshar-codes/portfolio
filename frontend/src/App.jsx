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
import { ROUTES } from "./constants/routes";

// Split public pages too: the home route no longer ships the project gallery,
// contact form, and resume editor dependencies in its initial JavaScript.
const Home = lazy(() => import("./pages/public/Home"));
const Services = lazy(() => import("./pages/public/Services"));
const Resume = lazy(() => import("./pages/public/Resume"));
const Work = lazy(() => import("./pages/public/Work"));
const Contact = lazy(() => import("./pages/public/Contact"));

// Admin lazy loads
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Activity = lazy(() => import("./pages/admin/Activity"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const ProjectEditor = lazy(() => import("./pages/admin/ProjectEditor"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const ManageMedia = lazy(() => import("./pages/admin/ManageMedia"));
// Rewritten onto the DataTable/React-Query admin architecture (see
// pages/admin/ManageMessages.jsx) — replaces the legacy
// pages/admin/Messages.jsx, which is now orphaned and can be deleted.
const ManageMessages = lazy(() => import("./pages/admin/ManageMessages"));
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
  <div className="admin-shell__loading" role="status" aria-label="Loading page">
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
                <Route path="/" element={<Suspense fallback={<Fallback />}><Home /></Suspense>} />
                <Route path="/services" element={<Suspense fallback={<Fallback />}><Services /></Suspense>} />
                <Route path="/resume" element={<Suspense fallback={<Fallback />}><Resume /></Suspense>} />
                <Route path="/work" element={<Suspense fallback={<Fallback />}><Work /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<Fallback />}><Contact /></Suspense>} />
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
                <Route path="activity" element={<Suspense fallback={<Fallback />}><Activity /></Suspense>} />
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
                  path="media"
                  element={
                    <Suspense fallback={<Fallback />}>
                      <ManageMedia />
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
                      <ManageMessages />
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
