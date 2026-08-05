import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Full data-access layer for the centralized Media Library
 * (backend/src/controllers/mediaController.js). Kept plain and
 * React-Query-free, matching createResourceApi.js's spirit — the
 * hooks layer (hooks/useMediaLibrary.js) owns caching/invalidation on
 * top of this.
 */
export const mediaApi = {
  list: (params) => api.get(API_ENDPOINTS.adminMedia, { params }).then((res) => res.data),

  upload: (formData, config) =>
    api
      .post(API_ENDPOINTS.adminMedia, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        ...config,
      })
      .then((res) => res.data),

  updateMetadata: (id, payload) =>
    api.patch(API_ENDPOINTS.adminMediaById(id), payload).then((res) => res.data),

  replace: (id, formData, config) =>
    api
      .patch(API_ENDPOINTS.adminMediaReplace(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
        ...config,
      })
      .then((res) => res.data),

  /** Soft delete — moves the item to the trash. */
  remove: (id) => api.delete(API_ENDPOINTS.adminMediaById(id)).then((res) => res.data),

  restore: (id) => api.patch(API_ENDPOINTS.adminMediaRestore(id)).then((res) => res.data),

  /** Hard delete — destroys the underlying Cloudinary asset. Cannot be undone. */
  permanentlyRemove: (id) =>
    api.delete(API_ENDPOINTS.adminMediaPermanent(id)).then((res) => res.data),

  bulkDelete: (ids) =>
    api.post(API_ENDPOINTS.adminMediaBulkDelete, { ids }).then((res) => res.data),

  bulkRestore: (ids) =>
    api.post(API_ENDPOINTS.adminMediaBulkRestore, { ids }).then((res) => res.data),

  bulkPermanentlyDelete: (ids) =>
    api.post(API_ENDPOINTS.adminMediaBulkPermanentDelete, { ids }).then((res) => res.data),
};
