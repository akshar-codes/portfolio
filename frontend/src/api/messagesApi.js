import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Full data-access layer for the admin Messages module
 * (backend/src/controllers/messageController.js). Kept plain and
 * React-Query-free, matching mediaApi.js's spirit — the hooks layer
 * (hooks/useMessages.js) owns caching/invalidation on top of this.
 */
export const messagesApi = {
  list: (params) => api.get(API_ENDPOINTS.messages, { params }).then((res) => res.data),

  getById: (id) => api.get(API_ENDPOINTS.messageById(id)).then((res) => res.data),

  getSummary: () => api.get(API_ENDPOINTS.messagesSummary).then((res) => res.data),

  updateStatus: (id, status) =>
    api.patch(API_ENDPOINTS.messageStatus(id), { status }).then((res) => res.data),

  sendReply: (id, { subject, body }) =>
    api.post(API_ENDPOINTS.messageReply(id), { subject, body }).then((res) => res.data),

  archive: (id) => api.patch(API_ENDPOINTS.messageArchive(id)).then((res) => res.data),

  restore: (id) => api.patch(API_ENDPOINTS.messageRestore(id)).then((res) => res.data),

  toggleSpam: (id, isSpam) =>
    api.patch(API_ENDPOINTS.messageSpam(id), { isSpam }).then((res) => res.data),

  /** Permanent delete. */
  remove: (id) => api.delete(API_ENDPOINTS.messageById(id)).then((res) => res.data),

  bulkUpdateStatus: (ids, status) =>
    api
      .post(API_ENDPOINTS.messagesBulkStatus, { ids, status })
      .then((res) => res.data),

  bulkArchive: (ids) =>
    api.post(API_ENDPOINTS.messagesBulkArchive, { ids }).then((res) => res.data),

  bulkRestore: (ids) =>
    api.post(API_ENDPOINTS.messagesBulkRestore, { ids }).then((res) => res.data),

  /** Permanent bulk delete. */
  bulkDelete: (ids) =>
    api.post(API_ENDPOINTS.messagesBulkDelete, { ids }).then((res) => res.data),
};
