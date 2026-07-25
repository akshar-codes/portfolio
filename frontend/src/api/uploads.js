/**
 * Client-side mirror of backend/src/utils/constants.js's image upload
 * constraints (ALLOWED_IMAGE_MIME_TYPES, MAX_FILE_SIZE_BYTES). Gives
 * immediate feedback before a request ever reaches the server — the
 * backend remains the source of truth and re-validates independently.
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const MAX_IMAGE_SIZE_MB = 5;
