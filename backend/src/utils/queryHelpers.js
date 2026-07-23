/**
 * Shared query-parsing helpers for pagination, searching, and sorting
 * across list-returning services (Project, Category, Message, ...).
 * Centralized so each module doesn't reimplement the same
 * regex-escaping / clamping logic independently.
 */

/** Escapes regex special characters so user search input is safe to embed in a RegExp. */
export function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a case-insensitive $or regex filter across multiple fields.
 * Returns {} (a no-op filter) when the search term is empty, so callers
 * can always `Object.assign(filter, buildSearchFilter(...))` safely.
 */
export function buildSearchFilter(searchTerm, fields = []) {
  const term = (searchTerm ?? "").trim();
  if (!term || fields.length === 0) return {};

  const pattern = new RegExp(escapeRegex(term), "i");
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

/** Clamps page/limit query params to safe integer bounds. */
export function parsePagination(
  { page, limit } = {},
  { defaultLimit = 10, maxLimit = 50 } = {},
) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(
    Math.max(1, parseInt(limit, 10) || defaultLimit),
    maxLimit,
  );
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * Builds a Mongoose-compatible sort object from `sortBy`/`sortOrder`
 * query params, restricted to an allow-list of sortable fields so a
 * client can never force a sort on an unindexed or sensitive field.
 */
export function parseSort(
  sortBy,
  sortOrder,
  allowedFields = [],
  defaultField = "createdAt",
) {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const direction = sortOrder === "asc" ? 1 : -1;
  return { [field]: direction };
}
