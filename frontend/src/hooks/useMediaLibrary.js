import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../api/mediaApi";

const LIST_KEY = ["media", "list"];

/* ── Reads ─────────────────────────────────────────────────────────── */

export function useMediaLibraryQuery(params, options = {}) {
  return useQuery({
    queryKey: [...LIST_KEY, params ?? {}],
    queryFn: () => mediaApi.list(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Infinite-scroll variant for the Media Library grid. Pages are keyed
 * by the same params (minus `page`, which React Query manages via
 * `pageParam`) so switching folder/search/sort naturally starts a
 * fresh page sequence instead of appending onto stale results.
 */
export function useInfiniteMediaLibraryQuery(params, options = {}) {
  const { limit = 24, ...restParams } = params ?? {};

  return useInfiniteQuery({
    queryKey: [...LIST_KEY, "infinite", restParams, limit],
    queryFn: ({ pageParam = 1 }) => mediaApi.list({ ...restParams, limit, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    ...options,
  });
}

/* ── Mutations ─────────────────────────────────────────────────────── */

function useInvalidateMediaList() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: LIST_KEY });
}

export function useUploadMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: ({ formData, onUploadProgress }) =>
      mediaApi.upload(formData, { onUploadProgress }),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateMediaMetadata(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: ({ id, payload }) => mediaApi.updateMetadata(id, payload),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useReplaceMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: ({ id, formData, onUploadProgress }) =>
      mediaApi.replace(id, formData, { onUploadProgress }),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (id) => mediaApi.remove(id),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useRestoreMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (id) => mediaApi.restore(id),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function usePermanentlyDeleteMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (id) => mediaApi.permanentlyRemove(id),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkDeleteMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (ids) => mediaApi.bulkDelete(ids),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkRestoreMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (ids) => mediaApi.bulkRestore(ids),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkPermanentlyDeleteMedia(options = {}) {
  const invalidateList = useInvalidateMediaList();
  return useMutation({
    mutationFn: (ids) => mediaApi.bulkPermanentlyDelete(ids),
    onSuccess: (...args) => {
      invalidateList();
      options.onSuccess?.(...args);
    },
  });
}
