import { categoriesApi } from "../api/categoriesApi";
import { createCrudResourceHooks } from "./useCrudResource";

const { useList, useCreate, useRemove } = createCrudResourceHooks({
  resourceKey: "categories",
  resourceApi: categoriesApi,
});

export {
  useList as useCategoriesQuery,
  useCreate as useCreateCategory,
  useRemove as useDeleteCategory,
};
