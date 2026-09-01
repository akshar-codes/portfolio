import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categoriesApi";
import { createCrudResourceHooks } from "./useCrudResource";

const { useList, useCreate, useUpdate, useRemove } = createCrudResourceHooks({
  resourceKey: "categories",
  resourceApi: categoriesApi,
});

/** Drag-reorder mutation — mirrors hooks/useProjects.js's useReorderProjects. */
export function useReorderCategories(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds) => categoriesApi.reorder(orderedIds),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      options.onSuccess?.(...args);
    },
  });
}

/** Shared factory for the 5 status-action mutations. */
function useCategoryStatusMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      options.onSuccess?.(...args);
    },
  });
}

export function usePublishCategory(options = {}) {
  return useCategoryStatusMutation((id) => categoriesApi.publish(id), options);
}

export function useUnpublishCategory(options = {}) {
  return useCategoryStatusMutation((id) => categoriesApi.unpublish(id), options);
}

export function useArchiveCategory(options = {}) {
  return useCategoryStatusMutation((id) => categoriesApi.archive(id), options);
}

export function useRestoreCategory(options = {}) {
  return useCategoryStatusMutation((id) => categoriesApi.restore(id), options);
}

export function useScheduleCategory(options = {}) {
  return useCategoryStatusMutation(
    ({ id, publishAt }) => categoriesApi.schedule(id, publishAt),
    options,
  );
}

export {
  useList as useCategoriesQuery,
  useCreate as useCreateCategory,
  useUpdate as useUpdateCategory,
  useRemove as useDeleteCategory,
};
