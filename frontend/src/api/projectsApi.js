import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Admin project data-access layer. Deliberately NOT built on
 * createResourceApi.js — see original file header for the full
 * rationale (drafts must stay visible to the admin panel, multipart
 * uploads, dedicated action endpoints rather than generic CRUD verbs).
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

  archive: (id) =>
    api.patch(API_ENDPOINTS.projectArchive(id)).then((res) => res.data),

  restore: (id) =>
    api.patch(API_ENDPOINTS.projectRestore(id)).then((res) => res.data),

  schedule: (id, publishAt) =>
    api
      .patch(API_ENDPOINTS.projectSchedule(id), { publishAt })
      .then((res) => res.data),
};
