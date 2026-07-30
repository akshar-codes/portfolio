import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_MB } from "../../api/uploads";

/**
 * Reusable image upload primitive. It only picks/previews/validates —
 * it never performs the upload itself, so the actual transport (direct
 * Cloudinary upload, multipart form POST, presigned URL, ...) stays
 * entirely swappable at the call site. Feed it `uploadProgress` (0-100)
 * from your mutation's axios `onUploadProgress` to show a live bar.
 */
export default function ImagePicker({
  label,
  hint,
  required = false,
  value, // string URL | File | null
  onChange, // (file: File) => void
  onRemove, // () => void
  accept = "image/*",
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  shape = "rect", // 'rect' | 'circle'
  aspectRatio = 16 / 9,
  disabled = false,
  uploadProgress, // number 0-100 | undefined
  error,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const inputId = useMemo(() => `image-picker-${Math.random().toString(36).slice(2, 9)}`, []);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof value === "string" && value) {
      setPreviewUrl(value);
      return undefined;
    }
    setPreviewUrl(null);
    return undefined;
  }, [value]);

  const validateAndAccept = (file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      setLocalError(`Unsupported file type. Allowed: ${[...ALLOWED_IMAGE_MIME_TYPES].join(", ")}.`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File is too large. Maximum size is ${maxSizeMB} MB.`);
      return;
    }

    setLocalError("");
    onChange(file);
  };

  const handleInputChange = (e) => {
    validateAndAccept(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    validateAndAccept(e.dataTransfer.files?.[0] ?? null);
  };

  const displayedError = error || localError;
  const isUploading = typeof uploadProgress === "number" && uploadProgress < 100;

  return (
    <Box className="flex flex-col gap-1.5">
      {label && (
        <Typography variant="body2" fontWeight={600}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Typography>
      )}

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
        }}
        aria-label={label ? `Upload ${label}` : "Upload image"}
        className={`relative flex items-center justify-center overflow-hidden border-2 border-dashed transition-colors ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
        sx={{
          borderColor: dragActive ? "primary.main" : displayedError ? "error.main" : "divider",
          bgcolor: dragActive ? "action.hover" : "background.default",
          width: shape === "circle" ? 140 : "100%",
          height: shape === "circle" ? 140 : "auto",
          aspectRatio: shape === "circle" ? undefined : aspectRatio,
          minHeight: shape === "circle" ? undefined : 140,
        }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label ?? "Preview"} className="w-full h-full object-cover" />
            {!disabled && !isUploading && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
                aria-label="Remove image"
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
            {isUploading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.55)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <CircularProgress variant="determinate" value={uploadProgress} size={32} sx={{ color: "#fff" }} />
                <Typography variant="caption" sx={{ color: "#fff" }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Box className="flex flex-col items-center gap-1.5 p-6 text-center">
            <CloudUploadOutlinedIcon sx={{ color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              Click or drag an image here
            </Typography>
          </Box>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </Box>

      {hint && !displayedError && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
      {displayedError && (
        <Typography variant="caption" color="error.main">
          {displayedError}
        </Typography>
      )}
    </Box>
  );
}
