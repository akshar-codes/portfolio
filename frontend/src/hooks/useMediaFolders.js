import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaFoldersApi } from "../api/mediaFoldersApi";

export const MEDIA_FOLDERS_QUERY_KEY = ["mediaFolders"];

export function useMediaFoldersQuery(options = {}) {
  return useQuery({
    queryKey: MEDIA_FOLDERS_QUERY_KEY,
    queryFn: mediaFoldersApi.list,
    staleTime: 30_000,
    ...options,
  });
}

export function useCreateMediaFolder(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => mediaFoldersApi.create(name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useRenameMediaFolder(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }) => mediaFoldersApi.rename(id, name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteMediaFolder(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => mediaFoldersApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}
