/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PERMISSIONS } from "../constants/permissions";

export const PermissionsContext = createContext(null);

/**
 * Derives the current admin's permission set. Reads `admin.permissions`
 * (a flat string array) if the backend ever sends one, otherwise grants
 * every permission — there is currently exactly one admin account type
 * (backend/src/models/Admin.js has no role/permissions field at all),
 * so "restrict nothing" is the only truthful default. UI code should
 * depend only on `can`/`canAny`/`canAll`, never on how the set was
 * resolved.
 */
export function PermissionsProvider({ children }) {
  const { authState, admin } = useAuth();

  const permissionSet = useMemo(() => {
    if (authState !== "authenticated") return new Set();
    const granted = Array.isArray(admin?.permissions) ? admin.permissions : DEFAULT_PERMISSIONS;
    return new Set(granted);
  }, [authState, admin]);

  const can = useCallback((permission) => permissionSet.has(permission), [permissionSet]);

  const canAny = useCallback(
    (permissions = []) => permissions.some((p) => permissionSet.has(p)),
    [permissionSet],
  );

  const canAll = useCallback(
    (permissions = []) => permissions.every((p) => permissionSet.has(p)),
    [permissionSet],
  );

  const value = useMemo(
    () => ({ permissions: permissionSet, can, canAny, canAll }),
    [permissionSet, can, canAny, canAll],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}
