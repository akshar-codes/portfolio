import api from "../services/api";

export const contentVersionsApi = {
  list: (resource, id) => api.get(`/admin/content/${resource}/${id}/versions`).then((r) => r.data),
  restore: (resource, id, versionId) => api.post(`/admin/content/${resource}/${id}/versions/${versionId}/restore`).then((r) => r.data),
};
