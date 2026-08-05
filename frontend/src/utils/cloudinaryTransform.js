const CLOUDINARY_UPLOAD_MARKER = "/upload/";

/**
 * Builds a Cloudinary-transformed delivery URL by inserting
 * transformation parameters right after `/upload/` in a secure_url.
 * This is Cloudinary's standard on-the-fly transformation mechanism —
 * no extra storage, no backend round-trip, and every size the app
 * needs is derived from the single original asset.
 *
 * Falls back to the original URL untouched if it doesn't look like a
 * Cloudinary delivery URL (defensive — e.g. a non-Cloudinary asset
 * slipping in from a legacy field).
 */
export function buildOptimizedUrl(
  url,
  { width, height, crop = "fill", quality = "auto", format = "auto" } = {},
) {
  if (!url || typeof url !== "string") return url;

  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const params = [`f_${format}`, `q_${quality}`];
  if (width) params.push(`w_${Math.round(width)}`);
  if (height) params.push(`h_${Math.round(height)}`);
  if (width || height) params.push(`c_${crop}`);

  const insertion = `${params.join(",")}/`;
  const splitIndex = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, splitIndex)}${insertion}${url.slice(splitIndex)}`;
}

/** Small, square-cropped preset for grid cards and picker thumbnails. */
export function getThumbnailUrl(url, size = 320) {
  return buildOptimizedUrl(url, { width: size, height: size, crop: "fill" });
}

/** Larger, unclipped preset for the details drawer / lightbox preview. */
export function getPreviewUrl(url, maxWidth = 1200) {
  return buildOptimizedUrl(url, { width: maxWidth, crop: "limit" });
}
