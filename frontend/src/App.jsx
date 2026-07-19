import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@mui/material/styles";

import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PrivateRoute from "./components/common/PrivateRoute";
import PublicLayout from "./layouts/PublicLayout";
import About from "./pages/About";
import Resume from "./pages/Resume";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import { ROUTES } from "./constants/routes";
import { muiTheme } from "./config/muiTheme";

const AdminLogin = lazy(() => import("../features/auth/AdminLogin"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const ManageProjects = lazy(
  () => import("../features/projects/ManageProjects"),
);
const AddProject = lazy(() => import("../features/projects/AddProject"));
const ManageCategories = lazy(
  () => import("../features/categories/ManageCategories"),
);
const Messages = lazy(() => import("../features/messages/Messages"));
const ManageResume = lazy(() => import("../features/resume/ManageResume"));
const ManageProfile = lazy(() => import("../features/profile/ManageProfile"));
const ManageAbout = lazy(() => import("../features/about/ManageAbout"));

const Fallback = () => (
  <div className="admin-shell__loading">
    <div className="a-spinner" />
  </div>
);

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
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
              <Route element={<PublicLayout />}>
                <Route path={ROUTES.home} element={<About />} />
                <Route path={ROUTES.resume} element={<Resume />} />
                <Route path={ROUTES.portfolio} element={<Portfolio />} />
                <Route path={ROUTES.contact} element={<Contact />} />
                <Route path="*" element={<ErrorPage />} />
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
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
