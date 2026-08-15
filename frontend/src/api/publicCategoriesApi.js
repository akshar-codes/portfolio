import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Public category list — only categories with at least one published
 * project, pre-sorted by admin display order (see backend
 * services/categoryService.js fetchPublicCategories). Distinct from
 * api/categoriesApi.js, the admin CRUD/reorder surface.
 */
export const publicCategoriesApi = {
  list: () => api.get(API_ENDPOINTS.categories).then((res) => res.data),
};
