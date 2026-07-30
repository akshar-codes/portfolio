import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import CloseIcon from "@mui/icons-material/Close";

import MediaPickerDialog from "../cms/MediaPickerDialog";

/**
 * Reusable "pick an image from the centralized Media Library" field.
 * Fully controlled (value/onChange), so it works equally well wrapped
 * in a react-hook-form <Controller> or driven by plain useState —
 * matching the same value/onChange contract as ImagePicker.jsx.
 *
 * This does not upload anything itself: it only lets the admin choose
 * an already-uploaded asset by URL, exactly like ManageSeo.jsx's
 * (previously inline, now extracted here) LibraryImageField.
 */
export default function LibraryImageField({
  label,
  value,
  onChange,
  hint,
  error,
  shape = "rect", // 'rect' | 'circle'
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} className="mb-1.5">
          {label}
        </Typography>
      )}

      <Box className="flex items-center gap-3 flex-wrap">
        <Box
          sx={{
            width: shape === "circle" ? 72 : 96,
            height: shape === "circle" ? 72 : 54,
            borderRadius: shape === "circle" ? "50%" : 1.5,
            border: "1px solid",
            borderColor: error ? "error.main" : "divider",
            bgcolor: "action.hover",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value ? (
            <img
              src={value}
              alt={label || "Preview"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              No image
            </Typography>
          )}
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<PhotoLibraryOutlinedIcon fontSize="small" />}
          onClick={() => setPickerOpen(true)}
        >
          {value ? "Replace" : "Choose from library"}
        </Button>

        {value && (
          <IconButton
            size="small"
            onClick={() => onChange("")}
            aria-label={`Clear ${label ?? "image"}`}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {hint && !error && (
        <Typography variant="caption" color="text.secondary" className="block mt-1">
          {hint}
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error.main" className="block mt-1">
          {error}
        </Typography>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        title={`Select ${(label || "image").toLowerCase()}`}
      />
    </Box>
  );
}
