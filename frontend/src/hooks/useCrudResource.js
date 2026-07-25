import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Factory for the standard list/item/create/update/remove React Query
 * hook set used by every admin CRUD resource. Centralizes cache-key
 * conventions and invalidation so each resource only needs to declare
 * a `resourceApi` (see api/createResourceApi.js) — no page ever writes
 * its own queryFn/invalidation logic.
 *
 * @param {object} config
 * @param {string} config.resourceKey - React Query cache namespace, e.g. "categories"
 * @param {ReturnType<typeof import('../api/createResourceApi').createResourceApi>} config.resourceApi
 */
export function createCrudResourceHooks({ resourceKey, resourceApi }) {
  const listKey = (params) => [resourceKey, "list", params ?? {}];
  const itemKey = (id) => [resourceKey, "item", id];

  function useList(params, options = {}) {
    return useQuery({
      queryKey: listKey(params),
      queryFn: () => resourceApi.list(params),
      placeholderData: (previousData) => previousData,
      ...options,
    });
  }

  function useItem(id, options = {}) {
    return useQuery({
      queryKey: itemKey(id),
      queryFn: () => resourceApi.getById(id),
      enabled: !!id && !!resourceApi.getById,
      ...options,
    });
  }

  function useCreate(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload) => resourceApi.create(payload),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });
        options.onSuccess?.(...args);
      },
    });
  }

  function useUpdate(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }) => resourceApi.update(id, payload),
      onSuccess: (data, variables, ...rest) => {
        queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });
        queryClient.setQueryData(itemKey(variables.id), data);
        options.onSuccess?.(data, variables, ...rest);
      },
    });
  }

  function useRemove(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id) => resourceApi.remove(id),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });
        options.onSuccess?.(...args);
      },
    });
  }

  return { useList, useItem, useCreate, useUpdate, useRemove, listKey, itemKey };
}
