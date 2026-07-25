import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { createResourceApi } from "./createResourceApi";

export const categoriesApi = createResourceApi({
  list: API_ENDPOINTS.adminCategories,
  create: API_ENDPOINTS.adminCategories,
  remove: (id) => API_ENDPOINTS.adminCategoryById(id),
  // No `byId`/`update` — the backend doesn't expose a PATCH route for
  // categories yet (categoryController.updateCategoryHandler exists
  // but routes/admin/categoryRoutes.js never mounts it). Add both here
  // the moment that route ships.
});
