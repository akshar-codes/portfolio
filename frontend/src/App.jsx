import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

// pages
import About from "./components/About";
import Resume from "./components/Resume";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import ErrorPage from "./pages/ErrorPage";

// shared components
import PrivateRoute from "./components/PrivateRoute";

// admin
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ManageProjects from "./admin/ManageProjects";
import AddProject from "./admin/AddProject";
import Messages from "./admin/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin login — public, no layout wrapper */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/*
            Protected admin routes.
            - A single <PrivateRoute> guards the whole /admin subtree.
            - <AdminLayout> renders the persistent admin nav + <Outlet>,
              so every child page drops into that slot automatically.
          */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="projects/new" element={<AddProject />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
