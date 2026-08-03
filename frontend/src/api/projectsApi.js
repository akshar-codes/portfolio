import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Admin project data-access layer. Deliberately NOT built on
 * createResourceApi.js:
 *   - listing/reads go through the dedicated /admin/projects endpoints
 *     (routes/admin/projectAdminRoutes.js) so drafts stay visible to
 *     the admin panel — the public /projects endpoints only ever
 *     return published projects.
 *   - create/update send multipart/form-data (thumbnail/banner/gallery
 *     uploads through the existing Cloudinary pipeline in
 *     config/cloudinary.js + services/projectService.js), not JSON.
 *   - publish/unpublish/reorder are dedicated action endpoints, not
 *     generic CRUD verbs.
 */
export const projectsApi = {
  list: (params) =>
    api.get(API_ENDPOINTS.adminProjects, { params }).then((res) => res.data),

  getById: (id) =>
    api.get(API_ENDPOINTS.adminProjectById(id)).then((res) => res.data),

  create: (formData) =>
    api
      .post(API_ENDPOINTS.projects, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),

  update: (id, formData) =>
    api
      .patch(API_ENDPOINTS.projectById(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),

  remove: (id) => api.delete(API_ENDPOINTS.projectById(id)).then((res) => res.data),

  reorder: (orderedIds) =>
    api
      .patch(API_ENDPOINTS.projectReorder, { orderedIds })
      .then((res) => res.data),

  publish: (id) =>
    api.patch(API_ENDPOINTS.projectPublish(id)).then((res) => res.data),

  unpublish: (id) =>
    api.patch(API_ENDPOINTS.projectUnpublish(id)).then((res) => res.data),
};
