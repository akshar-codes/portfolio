import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Footer is a singleton resource — same rationale as navigationApi.js.
 */
export const footerApi = {
  get: () => api.get(API_ENDPOINTS.adminFooter).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminFooter, payload).then((res) => res.data),

  publish: () => api.patch(API_ENDPOINTS.adminFooterPublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminFooterUnpublish).then((res) => res.data),
};
