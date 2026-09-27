import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { portfolioSnapshotApi } from "../api/portfolioSnapshotApi";

export function usePublicCategoriesQuery({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["categories", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminCategories).then(r => r.data) : portfolioSnapshotApi.load().then((snapshot) => snapshot.categories),
    staleTime: preview ? 0 : 5 * 60 * 1000,
    ...options,
  });
}
