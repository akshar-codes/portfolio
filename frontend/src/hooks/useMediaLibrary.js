import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "../api/mediaApi";

export function useMediaLibraryQuery(params, options = {}) {
  return useQuery({
    queryKey: ["media", "list", params],
    queryFn: () => mediaApi.list(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
