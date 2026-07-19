/**
 * Centralized route path constants.
 * Prevents literal route strings from being duplicated across
 * App.jsx, Navbar, AdminLayout, PrivateRoute, and Dashboard.
 */
export const ROUTES = {
  home: "/",
  resume: "/resume",
  portfolio: "/portfolio",
  contact: "/contact",

  adminLogin: "/admin/login",
  adminRoot: "/admin",
  adminDashboard: "/admin/dashboard",
  adminProfile: "/admin/profile",
  adminAbout: "/admin/about",
  adminProjects: "/admin/projects",
  adminProjectsNew: "/admin/projects/new",
  adminCategories: "/admin/categories",
  adminResume: "/admin/resume",
  adminMessages: "/admin/messages",
};
