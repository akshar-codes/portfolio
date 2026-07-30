import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Profile is a singleton resource, so it doesn't fit
 * createResourceApi.js's list/getById/create/update/remove shape.
 * Mirrors siteSettingsApi.js/navigationApi.js's plain, testable,
 * React-Query-free data access instead.
 */
export const profileApi = {
  get: () => api.get(API_ENDPOINTS.adminProfile).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminProfile, payload).then((res) => res.data),

  publish: () =>
    api.patch(API_ENDPOINTS.adminProfilePublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminProfileUnpublish).then((res) => res.data),
};
