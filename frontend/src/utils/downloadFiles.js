/**
 * Triggers a browser download for a single URL by fetching it as a
 * blob first (rather than a plain `<a href>` navigation), so
 * cross-origin Cloudinary URLs save with the original filename
 * instead of opening inline in a new tab.
 */
async function downloadOne(url, filename) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) {
    throw new Error(`Failed to fetch "${filename}" (HTTP ${response.status}).`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Downloads multiple media items sequentially, with a small stagger
 * between each so the browser doesn't flag "multiple automatic
 * downloads" and block them. Deliberately avoids zipping (and the
 * extra dependency that would require) — sequential native downloads
 * are the simplest correct solution for a handful of images.
 *
 * @param {Array<{ url: string, originalName?: string }>} items
 * @returns {Promise<{ succeeded: number, failed: number }>}
 */
export async function downloadMediaBatch(items, { staggerMs = 350 } = {}) {
  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await downloadOne(item.url, item.originalName || "download");
      succeeded += 1;
    } catch {
      failed += 1;
    }

    if (staggerMs) {
      await new Promise((resolve) => setTimeout(resolve, staggerMs));
    }
  }

  return { succeeded, failed };
}
