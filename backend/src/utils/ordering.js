/** Strips the client-only `_tempId` field before persisting. */
export function stripTempIds(arr) {
  return arr.map(({ _tempId, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

/**
 * Sorts by the existing `order` field, then re-numbers it sequentially
 */
export function normaliseOrder(arr) {
  return arr
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, idx) => ({ ...item, order: idx }));
}

/**
 * Same job as `stripTempIds` + `normaliseOrder`, but for a two-level
 * ordered tree (e.g. Navigation.items[].children) rather than a flat
 * array. The generic ORDERED_ARRAY_FIELDS handling in SingletonService
 * only understands a flat array's `order` field — it has no concept of
 * a nested child array, so a resource with real nesting (unlike
 * Footer.columns[].links[], which has no `order` field of its own and
 * relies on plain array position) needs this instead of the generic
 * path. Never trusts client-computed order values: both levels are
 * re-sequenced from scratch server-side, same as every other ordered
 * resource in this codebase.
 *
 * @param {Array<object>} arr - top-level items, each optionally holding `childField`
 * @param {string} childField - name of the nested ordered array, e.g. "children"
 */
export function sanitizeNestedItems(arr, childField) {
  const strippedTop = stripTempIds(arr).map((item) => {
    if (!Array.isArray(item[childField])) return item;
    return { ...item, [childField]: stripTempIds(item[childField]) };
  });

  return normaliseOrder(strippedTop).map((item) => {
    if (!Array.isArray(item[childField])) return item;
    return { ...item, [childField]: normaliseOrder(item[childField]) };
  });
}
