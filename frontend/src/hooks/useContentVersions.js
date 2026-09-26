import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentVersionsApi } from "../api/contentVersionsApi";

export function useContentVersions(resource, id, options = {}) {
  return useQuery({ queryKey: ["content-versions", resource, id], queryFn: () => contentVersionsApi.list(resource, id), enabled: Boolean(id), ...options });
}

export function useRestoreContentVersion(resource, id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (versionId) => contentVersionsApi.restore(resource, id, versionId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["content-versions", resource, id] });
      const collection = resource === "Project" ? "projects" : resource === "Category" ? "categories" : resource.toLowerCase();
      client.invalidateQueries({ queryKey: [collection] });
    },
  });
}
