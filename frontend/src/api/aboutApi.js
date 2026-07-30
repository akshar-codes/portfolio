import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * About is a singleton resource — same rationale as profileApi.js.
 */
export const aboutApi = {
  get: () => api.get(API_ENDPOINTS.adminAbout).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminAbout, payload).then((res) => res.data),

  publish: () =>
    api.patch(API_ENDPOINTS.adminAboutPublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminAboutUnpublish).then((res) => res.data),
};
