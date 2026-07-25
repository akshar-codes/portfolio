/**
 * Flat, resource-scoped permission keys. Deliberately NOT role-based —
 * every UI check should read `can("projects.create")`, never
 * `role === "admin"`. This keeps the frontend contract stable no
 * matter how the backend eventually resolves permissions (a flat list
 * per admin, a role-to-permission map, group-based grants, ...).
 */
export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: "dashboard.view",

  PROFILE_EDIT: "profile.edit",

  ABOUT_EDIT: "about.edit",

  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_EDIT: "projects.edit",
  PROJECTS_DELETE: "projects.delete",
  PROJECTS_REORDER: "projects.reorder",

  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_DELETE: "categories.delete",

  RESUME_EDIT: "resume.edit",

  MESSAGES_VIEW: "messages.view",
  MESSAGES_DELETE: "messages.delete",

  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",

  SETTINGS_EDIT: "settings.edit",
});

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Granted to every authenticated admin until the backend's Admin model
 * gains real per-account permissions (it currently has none — see
 * backend/src/models/Admin.js). The moment `GET /api/admin/verify`
 * starts returning a `permissions: string[]` array, PermissionsContext
 * picks it up automatically and this default stops being used.
 */
export const DEFAULT_PERMISSIONS = ALL_PERMISSIONS;
