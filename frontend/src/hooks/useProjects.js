import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projectsApi";

const LIST_KEY = ["projects", "admin", "list"];
const itemKey = (id) => ["projects", "admin", "item", id];

/* ── Reads ─────────────────────────────────────────────────────────── */

export function useAdminProjectsQuery(params, options = {}) {
  return useQuery({
    queryKey: [...LIST_KEY, params ?? {}],
    queryFn: () => projectsApi.list(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useAdminProjectQuery(id, options = {}) {
  return useQuery({
    queryKey: itemKey(id),
    queryFn: () => projectsApi.getById(id),
    enabled: Boolean(id),
    staleTime: 0, // always fresh in the admin panel
    ...options,
  });
}

/* ── Mutations ─────────────────────────────────────────────────────── */

function useInvalidateProjectsList() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: LIST_KEY });
}

export function useCreateProject(options = {}) {
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: (formData) => projectsApi.create(formData),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateProject(options = {}) {
  const queryClient = useQueryClient();
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: ({ id, formData }) => projectsApi.update(id, formData),
    onSuccess: (data, variables, ...rest) => {
      invalidateList();
      queryClient.setQueryData(itemKey(variables.id), data);
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}

export function useDeleteProject(options = {}) {
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: (id) => projectsApi.remove(id),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useReorderProjects(options = {}) {
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: (orderedIds) => projectsApi.reorder(orderedIds),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

/**
 * Shared factory for the 5 status-action mutations — every one follows
 * the identical "call the endpoint, refresh the list, refresh the
 * single-item cache" shape.
 */
function useProjectStatusMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, ...rest) => {
      invalidateList();
      const id = typeof variables === "object" ? variables.id : variables;
      queryClient.setQueryData(itemKey(id), data);
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}

export function usePublishProject(options = {}) {
  return useProjectStatusMutation((id) => projectsApi.publish(id), options);
}

export function useUnpublishProject(options = {}) {
  return useProjectStatusMutation((id) => projectsApi.unpublish(id), options);
}

export function useArchiveProject(options = {}) {
  return useProjectStatusMutation((id) => projectsApi.archive(id), options);
}

export function useRestoreProject(options = {}) {
  return useProjectStatusMutation((id) => projectsApi.restore(id), options);
}

export function useScheduleProject(options = {}) {
  return useProjectStatusMutation(
    ({ id, publishAt }) => projectsApi.schedule(id, publishAt),
    options,
  );
}
