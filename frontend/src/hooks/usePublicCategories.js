import { useQuery } from "@tanstack/react-query";
import { publicCategoriesApi } from "../api/publicCategoriesApi";

export function usePublicCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: ["categories", "public"],
    queryFn: publicCategoriesApi.list,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
