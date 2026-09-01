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

  // Drag-reorder — not a plain CRUD verb.
  reorder: (orderedIds) =>
    api
      .patch(API_ENDPOINTS.adminCategoryReorder, { orderedIds })
      .then((res) => res.data),

  // Publishing workflow — dedicated action endpoints. `update` above
  // (generic PATCH) only renames a category now; status changes always
  // go through these.
  publish: (id) => api.patch(API_ENDPOINTS.adminCategoryPublish(id)).then((res) => res.data),

  unpublish: (id) =>
    api.patch(API_ENDPOINTS.adminCategoryUnpublish(id)).then((res) => res.data),

  archive: (id) => api.patch(API_ENDPOINTS.adminCategoryArchive(id)).then((res) => res.data),

  restore: (id) => api.patch(API_ENDPOINTS.adminCategoryRestore(id)).then((res) => res.data),

  schedule: (id, publishAt) =>
    api
      .patch(API_ENDPOINTS.adminCategorySchedule(id), { publishAt })
      .then((res) => res.data),
};
