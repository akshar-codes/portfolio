import api from "../services/api";

/**
 * Builds the standard list/getById/create/update/remove request
 * functions for a REST resource from a set of endpoint paths. Kept
 * free of React Query so it's a plain, testable data-access layer —
 * the hooks layer (useCrudResource) owns caching/invalidation on top
 * of it, and either layer can be swapped independently.
 *
 * @param {object} endpoints
 * @param {string} endpoints.list
 * @param {(id: string) => string} [endpoints.byId]
 * @param {string} [endpoints.create]
 * @param {(id: string) => string} [endpoints.update]
 * @param {(id: string) => string} [endpoints.remove]
 */
export function createResourceApi({ list, byId, create, update, remove }) {
  return {
    list: (params) => api.get(list, { params }).then((res) => res.data),
    getById: byId ? (id) => api.get(byId(id)).then((res) => res.data) : undefined,
    create: create ? (payload, config) => api.post(create, payload, config).then((res) => res.data) : undefined,
    update: update ? (id, payload, config) => api.patch(update(id), payload, config).then((res) => res.data) : undefined,
    remove: remove ? (id) => api.delete(remove(id)).then((res) => res.data) : undefined,
  };
}
