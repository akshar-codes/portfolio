import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { toast } from "sonner";

import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_MB } from "../../api/uploads";
import { useUploadMedia } from "../../hooks/useMediaLibrary";

let uploadIdCounter = 0;

/**
 * Self-contained drag & drop / click-to-browse uploader. Uploads each
 * dropped file independently and in parallel (each with its own
 * tracked progress row), so one large or failing file never blocks
 * the rest of a batch.
 */
export default function MediaUploadDropzone({ folder = "" }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState([]); // [{ id, name, progress, status, error? }]
  const inputRef = useRef(null);
  const { mutateAsync: uploadMedia } = useUploadMedia();

  const updateUpload = (id, patch) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const removeUpload = (id) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const validateFile = (file) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      return `Unsupported file type: ${file.type || "unknown"}.`;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `File exceeds ${MAX_IMAGE_SIZE_MB} MB.`;
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file) => {
      const id = ++uploadIdCounter;
      setUploads((prev) => [...prev, { id, name: file.name, progress: 0, status: "uploading" }]);

      const validationError = validateFile(file);
      if (validationError) {
        updateUpload(id, { status: "error", error: validationError });
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      if (folder) fd.append("folder", folder);

      try {
        await uploadMedia({
          formData: fd,
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            updateUpload(id, { progress: Math.round((evt.loaded / evt.total) * 100) });
          },
        });
        updateUpload(id, { status: "done", progress: 100 });
        setTimeout(() => removeUpload(id), 2500);
      } catch (err) {
        updateUpload(id, { status: "error", error: err.message });
        toast.error(`${file.name}: ${err.message}`);
      }
    },
    [folder, uploadMedia],
  );

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList ?? []);
      if (files.length === 0) return;
      files.forEach((file) => uploadFile(file));
    },
    [uploadFile],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const hasActiveUploads = uploads.length > 0;

  return (
    <Box>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        sx={{
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "divider",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: dragActive ? "action.hover" : "background.default",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" fontWeight={600}>
          Drag & drop images here, or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary">
          JPG, PNG, WEBP, or GIF — max {MAX_IMAGE_SIZE_MB} MB each
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </Box>

      {hasActiveUploads && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          {uploads.map((u) => (
            <Box
              key={u.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: u.status === "error" ? "error.main" : "divider",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" noWrap sx={{ display: "block" }}>
                  {u.name}
                </Typography>
                {u.status === "error" ? (
                  <Typography variant="caption" color="error.main">
                    {u.error}
                  </Typography>
                ) : (
                  <LinearProgress
                    variant="determinate"
                    value={u.progress}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                  />
                )}
              </Box>
              <IconButton size="small" onClick={() => removeUpload(u.id)} aria-label={`Dismiss ${u.name}`}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
