import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Read-only surface over the centralized Media Library
 * (backend/src/controllers/mediaController.js). Upload/replace/delete
 * already have their own dedicated admin page — this module exists
 * purely so other admin pages (SEO's image pickers) can list/search
 * existing assets without depending on that page's internals.
 */
export const mediaApi = {
  list: (params) => api.get(API_ENDPOINTS.adminMedia, { params }).then((res) => res.data),
};
