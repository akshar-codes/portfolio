import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_NAV_TREE } from "../constants/navigation";
import { ROUTES } from "../constants/routes";

/** Exact-match walk down the tree, returning the full parent chain. */
function findExactPath(nodes, pathname, trail = []) {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.path && node.path === pathname) return nextTrail;
    if (node.children) {
      const childMatch = findExactPath(node.children, pathname, nextTrail);
      if (childMatch) return childMatch;
    }
  }
  return null;
}

/** Fallback for nested/unlisted paths (e.g. a future detail route) — longest-prefix match. */
function findBestPrefixMatch(nodes, pathname, trail = []) {
  let best = null;
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.path && pathname.startsWith(node.path)) {
      const bestLength = best ? best[best.length - 1].path.length : -1;
      if (node.path.length > bestLength) best = nextTrail;
    }
    if (node.children) {
      const childBest = findBestPrefixMatch(node.children, pathname, nextTrail);
      if (childBest) {
        const bestLength = best ? best[best.length - 1].path.length : -1;
        const childLength = childBest[childBest.length - 1].path.length;
        if (childLength > bestLength) best = childBest;
      }
    }
  }
  return best;
}

/**
 * Resolves the current breadcrumb trail purely from ADMIN_NAV_TREE +
 * the current URL — no page ever declares its own breadcrumb path.
 */
export function useBreadcrumbs() {
  const location = useLocation();

  return useMemo(() => {
    const trailNodes =
      findExactPath(ADMIN_NAV_TREE, location.pathname) ??
      findBestPrefixMatch(ADMIN_NAV_TREE, location.pathname) ??
      [];

    const crumbs = [{ label: "Dashboard", path: ROUTES.adminDashboard }];
    for (const node of trailNodes) {
      if (node.path === ROUTES.adminDashboard) continue;
      crumbs.push({ label: node.label, path: node.path });
    }
    return crumbs;
  }, [location.pathname]);
}
