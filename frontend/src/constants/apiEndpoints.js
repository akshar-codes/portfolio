/**
 * Centralized API endpoint paths (relative to VITE_API_BASE_URL).
 * Consumers should never hardcode a path string inline — import from
 * here so a path change only needs to happen in one place.
 */
export const API_ENDPOINTS = {
  // Profile
  profile: "/profile",
  adminProfile: "/admin/profile",

  // About
  about: "/about",
  adminAbout: "/admin/about",

  // Resume
  resume: "/resume",
  adminResume: "/admin/resume",

  // Categories
  categories: "/categories",
  adminCategories: "/admin/categories",
  adminCategoryById: (id) => `/admin/categories/${id}`,

  // Projects
  projects: "/projects",
  projectById: (id) => `/projects/${id}`,
  projectReorder: "/projects/reorder",

  // Messages
  messages: "/messages",
  messageById: (id) => `/messages/${id}`,

  // Site Settings
  siteSettings: "/site-settings",
  adminSiteSettings: "/admin/site-settings",
  adminSiteSettingsPublish: "/admin/site-settings/publish",
  adminSiteSettingsUnpublish: "/admin/site-settings/unpublish",
  adminSiteSettingsLogo: "/admin/site-settings/logo",
  adminSiteSettingsFavicon: "/admin/site-settings/favicon",

  // Admin auth
  adminLogin: "/admin/login",
  adminLogout: "/admin/logout",
  adminVerify: "/admin/verify",
};
