import { useMutation } from "@tanstack/react-query";
import { contactApi } from "../api/contactApi";

/**
 * @returns react-query mutation: mutateAsync({ fullname, email, message, website? })
 */
export function useSendMessage(options = {}) {
  return useMutation({
    mutationFn: (payload) => contactApi.send(payload),
    ...options,
  });
}
