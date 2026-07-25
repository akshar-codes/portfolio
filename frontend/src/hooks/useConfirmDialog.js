import { useContext } from "react";
import { ConfirmDialogContext } from "../contexts/ConfirmDialogContext";

/**
 * @returns {(options: { title: string, description?: string, confirmLabel?: string, cancelLabel?: string, tone?: 'default'|'danger' }) => Promise<boolean>}
 */
export function useConfirmDialog() {
  const confirm = useContext(ConfirmDialogContext);
  if (!confirm) {
    throw new Error("useConfirmDialog must be used inside <ConfirmDialogProvider>");
  }
  return confirm;
}
