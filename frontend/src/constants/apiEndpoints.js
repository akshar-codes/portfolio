/**
 * Centralized API endpoint paths (relative to VITE_API_BASE_URL).
 * Consumers should never hardcode a path string inline — import from
 * here so a path change only needs to happen in one place.
 */
export const API_ENDPOINTS = {
  // Profile
  profile: "/profile",
  adminProfile: "/admin/profile",
  adminProfilePublish: "/admin/profile/publish",
  adminProfileUnpublish: "/admin/profile/unpublish",

  // About
  about: "/about",
  adminAbout: "/admin/about",
  adminAboutPublish: "/admin/about/publish",
  adminAboutUnpublish: "/admin/about/unpublish",

  // Resume
  resume: "/resume",
  adminResume: "/admin/resume",
  adminResumePublish: "/admin/resume/publish",
  adminResumeUnpublish: "/admin/resume/unpublish",

  // Categories
  categories: "/categories",
  adminCategories: "/admin/categories",
  adminCategoryById: (id) => `/admin/categories/${id}`,
  adminCategoryReorder: "/admin/categories/reorder",

  // Projects
  projects: "/projects",
  projectById: (id) => `/projects/${id}`,
  projectReorder: "/projects/reorder",
  projectPublish: (id) => `/projects/${id}/publish`,
  projectUnpublish: (id) => `/projects/${id}/unpublish`,
  // Admin-only listing — includes drafts (see
  // routes/admin/projectAdminRoutes.js). The public `projects`/
  // `projectById` above only ever return published projects, so the
  // admin table/editor must read through these instead.
  adminProjects: "/admin/projects",
  adminProjectById: (id) => `/admin/projects/${id}`,

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

  // Navigation
  navigation: "/navigation",
  adminNavigation: "/admin/navigation",
  adminNavigationPublish: "/admin/navigation/publish",
  adminNavigationUnpublish: "/admin/navigation/unpublish",

  // Footer
  footer: "/footer",
  adminFooter: "/admin/footer",
  adminFooterPublish: "/admin/footer/publish",
  adminFooterUnpublish: "/admin/footer/unpublish",

  // SEO
  seo: "/seo",
  adminSeo: "/admin/seo",
  adminSeoPublish: "/admin/seo/publish",
  adminSeoUnpublish: "/admin/seo/unpublish",

  // Media library (admin-only)
  adminMedia: "/admin/media",
  adminMediaById: (id) => `/admin/media/${id}`,
  adminMediaReplace: (id) => `/admin/media/${id}/replace`,
  adminMediaRestore: (id) => `/admin/media/${id}/restore`,
  adminMediaPermanent: (id) => `/admin/media/${id}/permanent`,
  adminMediaBulkDelete: "/admin/media/bulk-delete",
  adminMediaBulkRestore: "/admin/media/bulk-restore",
  adminMediaBulkPermanentDelete: "/admin/media/bulk-permanent-delete",

  // Media folders (admin-only)
  adminMediaFolders: "/admin/media-folders",
  adminMediaFolderById: (id) => `/admin/media-folders/${id}`,

  // Admin auth
  adminLogin: "/admin/login",
  adminLogout: "/admin/logout",
  adminVerify: "/admin/verify",
};
