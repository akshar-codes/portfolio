import { usePermissions } from "../../hooks/usePermissions";

/**
 * Conditionally renders `children` based on the current admin's
 * permission set. Works for two shapes of guard:
 *   - a single UI action:      <RequirePermission permission={PERMISSIONS.CATEGORIES_DELETE}>
 *   - a whole route element:   <RequirePermission permission={...} fallback={<Navigate to={ROUTES.adminUnauthorized} replace />}>
 *
 * `permission` accepts a single key or an array; `mode` controls
 * whether an array is evaluated with ANY or ALL semantics.
 */
export default function RequirePermission({ permission, mode = "any", fallback = null, children }) {
  const { canAny, canAll } = usePermissions();

  const required = Array.isArray(permission) ? permission : [permission];
  const allowed = mode === "all" ? canAll(required) : canAny(required);

  return allowed ? children : fallback;
}
