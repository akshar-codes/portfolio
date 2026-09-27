/**
 * Centralized API endpoint paths (relative to VITE_API_BASE_URL).
 * Consumers should never hardcode a path string inline — import from
 * here so a path change only needs to happen in one place.
 */
export const API_ENDPOINTS = {
  portfolioAnalyticsEvent: "/analytics/events",
  adminPortfolioAnalytics: "/admin/analytics",
  adminPortfolioAnalyticsExport: "/admin/analytics/export.csv",
  adminActivity: "/admin/activity",
  adminActivityExport: "/admin/activity/export.csv",
  // Profile
  profile: "/profile",
  adminProfile: "/admin/profile",
  adminProfilePublish: "/admin/profile/publish",
  adminProfileUnpublish: "/admin/profile/unpublish",
  adminProfileArchive: "/admin/profile/archive",
  adminProfileRestore: "/admin/profile/restore",
  adminProfileSchedule: "/admin/profile/schedule",

  // About
  about: "/about",
  adminAbout: "/admin/about",
  adminAboutPublish: "/admin/about/publish",
  adminAboutUnpublish: "/admin/about/unpublish",
  adminAboutArchive: "/admin/about/archive",
  adminAboutRestore: "/admin/about/restore",
  adminAboutSchedule: "/admin/about/schedule",

  // Resume
  resume: "/resume",
  adminResume: "/admin/resume",
  adminResumePublish: "/admin/resume/publish",
  adminResumeUnpublish: "/admin/resume/unpublish",
  adminResumeArchive: "/admin/resume/archive",
  adminResumeRestore: "/admin/resume/restore",
  adminResumeSchedule: "/admin/resume/schedule",

  // Categories
  categories: "/categories",
  adminCategories: "/admin/categories",
  adminCategoryById: (id) => `/admin/categories/${id}`,
  adminCategoryReorder: "/admin/categories/reorder",
  adminCategoryPublish: (id) => `/admin/categories/${id}/publish`,
  adminCategoryUnpublish: (id) => `/admin/categories/${id}/unpublish`,
  adminCategoryArchive: (id) => `/admin/categories/${id}/archive`,
  adminCategoryRestore: (id) => `/admin/categories/${id}/restore`,
  adminCategorySchedule: (id) => `/admin/categories/${id}/schedule`,

  // Projects
  projects: "/projects",
  projectById: (id) => `/projects/${id}`,
  projectReorder: "/projects/reorder",
  projectPublish: (id) => `/projects/${id}/publish`,
  projectUnpublish: (id) => `/projects/${id}/unpublish`,
  projectArchive: (id) => `/projects/${id}/archive`,
  projectRestore: (id) => `/projects/${id}/restore`,
  projectSchedule: (id) => `/projects/${id}/schedule`,
  // Admin-only listing — includes drafts.
  adminProjects: "/admin/projects",
  adminProjectById: (id) => `/admin/projects/${id}`,

  // Messages
  messages: "/messages",
  messageById: (id) => `/messages/${id}`,
  messagesSummary: "/messages/summary",
  messageStatus: (id) => `/messages/${id}/status`,
  messageReply: (id) => `/messages/${id}/reply`,
  messageArchive: (id) => `/messages/${id}/archive`,
  messageRestore: (id) => `/messages/${id}/restore`,
  messageSpam: (id) => `/messages/${id}/spam`,
  messagesBulkStatus: "/messages/bulk-status",
  messagesBulkArchive: "/messages/bulk-archive",
  messagesBulkRestore: "/messages/bulk-restore",
  messagesBulkDelete: "/messages/bulk-delete",

  // Site Settings
  siteSettings: "/site-settings",
  adminSiteSettings: "/admin/site-settings",
  adminSiteSettingsPublish: "/admin/site-settings/publish",
  adminSiteSettingsUnpublish: "/admin/site-settings/unpublish",
  adminSiteSettingsArchive: "/admin/site-settings/archive",
  adminSiteSettingsRestore: "/admin/site-settings/restore",
  adminSiteSettingsSchedule: "/admin/site-settings/schedule",
  adminSiteSettingsLogo: "/admin/site-settings/logo",
  adminSiteSettingsFavicon: "/admin/site-settings/favicon",

  // Navigation
  navigation: "/navigation",
  adminNavigation: "/admin/navigation",
  adminNavigationPublish: "/admin/navigation/publish",
  adminNavigationUnpublish: "/admin/navigation/unpublish",
  adminNavigationArchive: "/admin/navigation/archive",
  adminNavigationRestore: "/admin/navigation/restore",
  adminNavigationSchedule: "/admin/navigation/schedule",

  // Footer
  footer: "/footer",
  adminFooter: "/admin/footer",
  adminFooterPublish: "/admin/footer/publish",
  adminFooterUnpublish: "/admin/footer/unpublish",
  adminFooterArchive: "/admin/footer/archive",
  adminFooterRestore: "/admin/footer/restore",
  adminFooterSchedule: "/admin/footer/schedule",

  // SEO
  seo: "/seo",
  adminSeo: "/admin/seo",
  adminSeoPublish: "/admin/seo/publish",
  adminSeoUnpublish: "/admin/seo/unpublish",
  adminSeoArchive: "/admin/seo/archive",
  adminSeoRestore: "/admin/seo/restore",
  adminSeoSchedule: "/admin/seo/schedule",

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
  adminPublish: "/admin/publish",
  adminChangePassword: "/admin/password",
};
