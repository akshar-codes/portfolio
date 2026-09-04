import { useQuery } from "@tanstack/react-query";
import { publicCategoriesApi } from "../api/publicCategoriesApi";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export function usePublicCategoriesQuery({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["categories", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminCategories).then(r => r.data) : publicCategoriesApi.list(),
    staleTime: preview ? 0 : 5 * 60 * 1000,
    ...options,
  });
}
