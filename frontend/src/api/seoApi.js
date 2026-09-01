import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * SEO is a singleton resource — same rationale as navigationApi.js.
 */
export const seoApi = {
  get: () => api.get(API_ENDPOINTS.adminSeo).then((res) => res.data),

  update: (payload) => api.patch(API_ENDPOINTS.adminSeo, payload).then((res) => res.data),

  publish: () => api.patch(API_ENDPOINTS.adminSeoPublish).then((res) => res.data),

  unpublish: () => api.patch(API_ENDPOINTS.adminSeoUnpublish).then((res) => res.data),

  archive: () => api.patch(API_ENDPOINTS.adminSeoArchive).then((res) => res.data),

  restore: () => api.patch(API_ENDPOINTS.adminSeoRestore).then((res) => res.data),

  schedule: (publishAt) =>
    api.patch(API_ENDPOINTS.adminSeoSchedule, { publishAt }).then((res) => res.data),
};
