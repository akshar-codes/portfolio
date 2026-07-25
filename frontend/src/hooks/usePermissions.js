import { useContext } from "react";
import { PermissionsContext } from "../contexts/PermissionsContext";

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used inside <PermissionsProvider>");
  }
  return ctx;
}
