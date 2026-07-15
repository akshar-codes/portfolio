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
