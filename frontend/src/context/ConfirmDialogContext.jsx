/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState } from "react";
import ConfirmDialog from "../components/admin/ConfirmDialog";

export const ConfirmDialogContext = createContext(null);

const DEFAULT_OPTIONS = {
  title: "Are you sure?",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  tone: "default",
};

/**
 * App-wide imperative confirmation dialog. Any component can call
 * `useConfirmDialog()` and `await confirm({ title, description, tone })`
 * to get a Promise<boolean>, replacing scattered `window.confirm(...)`
 * calls with one consistent, accessible MUI dialog.
 */
export function ConfirmDialogProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setRequest({ ...DEFAULT_OPTIONS, ...options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    request?.resolve(true);
    setRequest(null);
  };

  const handleCancel = () => {
    request?.resolve(false);
    setRequest(null);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!request}
        title={request?.title}
        description={request?.description}
        confirmLabel={request?.confirmLabel}
        cancelLabel={request?.cancelLabel}
        tone={request?.tone}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}
