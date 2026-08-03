import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categoriesApi";
import { createCrudResourceHooks } from "./useCrudResource";

const { useList, useCreate, useUpdate, useRemove } = createCrudResourceHooks({
  resourceKey: "categories",
  resourceApi: categoriesApi,
});

/**
 * Drag-reorder mutation — not part of the generic CRUD hook set since
 * `reorder` isn't a list/getById/create/update/remove verb. Mirrors
 * hooks/useProjects.js's useReorderProjects.
 */
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

export {
  useList as useCategoriesQuery,
  useCreate as useCreateCategory,
  useUpdate as useUpdateCategory,
  useRemove as useDeleteCategory,
};
