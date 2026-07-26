import { useState } from "react";
import { toast } from "sonner";

/**
 * Immediate-upload image widget for singleton image fields backed by a
 * dedicated Cloudinary Stage → Save → Destroy endpoint (see
 * services/SiteSettingsService.js uploadSiteLogo/uploadSiteFavicon on
 * the backend). Unlike a deferred file picker, selecting a file here
 * uploads and persists immediately — there is no separate "Save" step,
 * which matches the backend's design (logo/favicon are intentionally
 * excluded from the generic settings PATCH).
 */
export default function LogoFaviconUploader({
  label,
  hint,
  asset, // { url, public_id } | null | undefined
  onUpload, // (file) => Promise<void>
  onRemove, // () => Promise<void>
  shape = "rect", // 'rect' | 'square'
  accept = "image/*",
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const hasAsset = Boolean(asset?.url);
  const busy = uploading || removing;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
      toast.success(`${label} updated.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Remove the current ${label.toLowerCase()}?`)) return;

    setRemoving(true);
    try {
      await onRemove();
      toast.success(`${label} removed.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="admin-form__field">
      <label className="admin-form__label">{label}</label>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            width: shape === "square" ? 72 : 120,
            height: 72,
            borderRadius: shape === "square" ? 12 : 10,
            overflow: "hidden",
            background: "var(--onyx)",
            border: "1px solid var(--jet)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {hasAsset ? (
            <img
              src={asset.url}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 11, color: "var(--light-gray)" }}>
              No {label.toLowerCase()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label
            className="file-label has-file"
            style={{
              maxWidth: 220,
              opacity: busy ? 0.6 : 1,
              pointerEvents: busy ? "none" : "auto",
            }}
          >
            <span className="file-label__icon">📁</span>
            <span className="file-label__text">
              {uploading
                ? "Uploading…"
                : hasAsset
                  ? `Replace ${label.toLowerCase()}`
                  : `Upload ${label.toLowerCase()}`}
            </span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={busy}
              className="file-input"
            />
          </label>

          {hasAsset && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleRemove}
              disabled={busy}
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
      </div>

      {hint && (
        <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 6 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
