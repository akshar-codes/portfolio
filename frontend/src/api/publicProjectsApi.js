import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Public (unauthenticated) project reads — only ever returns published
 * projects (see backend services/projectService.js fetchAllProjects /
 * fetchProjectById). Distinct from api/projectsApi.js, which is the
 * admin-authenticated surface (drafts included, multipart create/update).
 */
export const publicProjectsApi = {
  list: (params) => api.get(API_ENDPOINTS.projects, { params }).then((res) => res.data),
  getById: (id) => api.get(API_ENDPOINTS.projectById(id)).then((res) => res.data),
};
