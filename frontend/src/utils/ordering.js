/**
 * Swaps the item at `index` with its neighbor in `direction` (-1 or 1).
 */
export function moveItem(arr, index, direction, { renumber = true } = {}) {
  const next = index + direction;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return renumber ? copy.map((item, i) => ({ ...item, order: i })) : copy;
}

/** Strips the client-only `_tempId` field before sending to the API. */
export function stripTempIds(arr) {
  return arr.map(({ _tempId, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

/**
 * Compares the local `_id`/`_tempId` sequence against the last
 * server-confirmed sequence to determine whether a manual reorder is
 * "dirty" (unsaved).
 */
export function isOrderDirty(local, server) {
  if (!local || !server || local.length !== server.length) return false;
  return local.some((item, i) => {
    const serverId = server[i]?._id ?? server[i]?._tempId;
    return item._id !== serverId && item._tempId !== serverId;
  });
}
