const ASPECT_RATIOS = { square: 1, portrait: 4 / 5, landscape: 16 / 9 };

/** Client-side crop, resize and WebP compression before the Cloudinary upload. */
export async function processMediaFile(file, { aspect = "original", quality = 0.82, maxDimension = 2560 } = {}) {
  if (!file || file.type === "image/gif" || !file.type.startsWith("image/")) return file;
  const image = await createImageBitmap(file);
  try {
    let sx = 0; let sy = 0; let sw = image.width; let sh = image.height;
    const targetRatio = ASPECT_RATIOS[aspect];
    if (targetRatio) {
      if (sw / sh > targetRatio) { sw = sh * targetRatio; sx = (image.width - sw) / 2; }
      else { sh = sw / targetRatio; sy = (image.height - sh) / 2; }
    }
    const scale = Math.min(1, maxDimension / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const context = canvas.getContext("2d", { alpha: true });
    context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: file.lastModified });
  } finally {
    image.close?.();
  }
}
