const SNAPSHOT_URL = "/generated/portfolio.json";

let snapshotPromise;

async function loadSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = fetch(SNAPSHOT_URL).then(async (response) => {
      if (!response.ok) throw new Error(`Portfolio snapshot request failed (${response.status}).`);
      return response.json();
    }).catch((error) => {
      snapshotPromise = undefined;
      throw error;
    });
  }
  return snapshotPromise;
}

export const portfolioSnapshotApi = { load: loadSnapshot };
