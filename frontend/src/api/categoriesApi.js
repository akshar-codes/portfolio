import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { createResourceApi } from "./createResourceApi";

export const categoriesApi = {
  ...createResourceApi({
    list: API_ENDPOINTS.adminCategories,
    create: API_ENDPOINTS.adminCategories,
    update: (id) => API_ENDPOINTS.adminCategoryById(id),
    remove: (id) => API_ENDPOINTS.adminCategoryById(id),
  }),

  // Drag-reorder — not a plain CRUD verb, so it doesn't fit
  // createResourceApi's list/getById/create/update/remove shape.
  // Mirrors the standalone `reorder` action already used for Projects
  // (services/projectService.js reorderProjects).
  reorder: (orderedIds) =>
    api
      .patch(API_ENDPOINTS.adminCategoryReorder, { orderedIds })
      .then((res) => res.data),
};
