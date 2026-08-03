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

export function usePublishProject(options = {}) {
  const queryClient = useQueryClient();
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: (id) => projectsApi.publish(id),
    onSuccess: (data, id, ...rest) => {
      invalidateList();
      queryClient.setQueryData(itemKey(id), data);
      options.onSuccess?.(data, id, ...rest);
    },
  });
}

export function useUnpublishProject(options = {}) {
  const queryClient = useQueryClient();
  const invalidateList = useInvalidateProjectsList();
  return useMutation({
    mutationFn: (id) => projectsApi.unpublish(id),
    onSuccess: (data, id, ...rest) => {
      invalidateList();
      queryClient.setQueryData(itemKey(id), data);
      options.onSuccess?.(data, id, ...rest);
    },
  });
}
