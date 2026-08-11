import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "../api/messagesApi";

const LIST_KEY = ["messages", "admin", "list"];
const itemKey = (id) => ["messages", "admin", "item", id];
const SUMMARY_KEY = ["messages", "admin", "summary"];

/* ================================================================== *
 * Reads
 * ================================================================== */

export function useAdminMessagesQuery(params, options = {}) {
  return useQuery({
    queryKey: [...LIST_KEY, params ?? {}],
    queryFn: () => messagesApi.list(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useAdminMessageQuery(id, options = {}) {
  return useQuery({
    queryKey: itemKey(id),
    queryFn: () => messagesApi.getById(id),
    enabled: Boolean(id),
    ...options,
  });
}

/**
 * Backs the Dashboard "recent messages" widget, the sidebar unread
 * badge, and the notification watcher — all three mount this same
 * hook; React Query dedupes identical queryKeys into a single shared
 * subscription/network request rather than one per consumer.
 * `refetchIntervalInBackground` defaults to false, so polling pauses
 * automatically while the browser tab is unfocused.
 */
export function useMessageSummaryQuery(options = {}) {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: messagesApi.getSummary,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

/* ================================================================== *
 * Mutations
 * ================================================================== */

function useInvalidateMessages() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
    queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
  };
}

export function useUpdateMessageStatus(options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: ({ id, status }) => messagesApi.updateStatus(id, status),
    onSuccess: (data, variables, ...rest) => {
      invalidate();
      queryClient.setQueryData(itemKey(variables.id), data);
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}

export function useArchiveMessage(options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (id) => messagesApi.archive(id),
    onSuccess: (data, id, ...rest) => {
      invalidate();
      queryClient.setQueryData(itemKey(id), data);
      options.onSuccess?.(data, id, ...rest);
    },
  });
}

export function useRestoreMessage(options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (id) => messagesApi.restore(id),
    onSuccess: (data, id, ...rest) => {
      invalidate();
      queryClient.setQueryData(itemKey(id), data);
      options.onSuccess?.(data, id, ...rest);
    },
  });
}

export function useToggleMessageSpam(options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: ({ id, isSpam }) => messagesApi.toggleSpam(id, isSpam),
    onSuccess: (data, variables, ...rest) => {
      invalidate();
      queryClient.setQueryData(itemKey(variables.id), data);
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}

export function useDeleteMessage(options = {}) {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (id) => messagesApi.remove(id),
    onSuccess: (...args) => {
      invalidate();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkUpdateMessageStatus(options = {}) {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: ({ ids, status }) => messagesApi.bulkUpdateStatus(ids, status),
    onSuccess: (...args) => {
      invalidate();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkArchiveMessages(options = {}) {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (ids) => messagesApi.bulkArchive(ids),
    onSuccess: (...args) => {
      invalidate();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkRestoreMessages(options = {}) {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (ids) => messagesApi.bulkRestore(ids),
    onSuccess: (...args) => {
      invalidate();
      options.onSuccess?.(...args);
    },
  });
}

export function useBulkDeleteMessages(options = {}) {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (ids) => messagesApi.bulkDelete(ids),
    onSuccess: (...args) => {
      invalidate();
      options.onSuccess?.(...args);
    },
  });
}
