import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Navigation is a singleton resource, so it doesn't fit
 * createResourceApi.js's list/getById/create/update/remove shape.
 * Mirrors siteSettingsApi.js's plain, testable, React-Query-free data
 * access instead.
 */
export const navigationApi = {
  get: () => api.get(API_ENDPOINTS.adminNavigation).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminNavigation, payload).then((res) => res.data),

  publish: () =>
    api.patch(API_ENDPOINTS.adminNavigationPublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminNavigationUnpublish).then((res) => res.data),
};
