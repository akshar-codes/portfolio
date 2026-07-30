import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Resume is a singleton resource — same rationale as profileApi.js.
 */
export const resumeApi = {
  get: () => api.get(API_ENDPOINTS.adminResume).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminResume, payload).then((res) => res.data),

  publish: () =>
    api.patch(API_ENDPOINTS.adminResumePublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminResumeUnpublish).then((res) => res.data),
};
