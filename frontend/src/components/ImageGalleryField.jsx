import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";

import DragReorderList from "./cms/DragReorderList";
import MediaPickerDialog from "./cms/MediaPickerDialog";

/**
 * Reusable ordered image-gallery editor: pick from the Media Library,
 * caption/alt text per image, drag-to-reorder, remove. Built as a
 * generic field (items/onChange) rather than baked into About's page
 * so any future gallery-shaped CMS field can reuse it without
 * duplicating this logic.
 *
 * `items` shape: [{ _tempId, _id?, url, altText, caption }]
 */
export default function ImageGalleryField({
  items,
  onChange,
  maxItems = 12,
  label = "Images",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const addImage = (url) => {
    if (!url || items.length >= maxItems) return;
    onChange([
      ...items,
      { _tempId: crypto.randomUUID(), url, altText: "", caption: "" },
    ]);
  };

  const updateItem = (tempId, patch) =>
    onChange(items.map((it) => (it._tempId === tempId ? { ...it, ...patch } : it)));

  const removeItem = (tempId) => onChange(items.filter((it) => it._tempId !== tempId));

  return (
    <Box>
      <Box className="flex items-center justify-between mb-2">
        <Typography variant="subtitle2" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {items.length}/{maxItems}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" className="py-4 text-center">
          No images yet.
        </Typography>
      ) : (
        <DragReorderList
          items={items}
          getId={(item) => item._tempId}
          onReorder={onChange}
          renderItem={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-start gap-2">
                <Box
                  sx={{
                    width: 88,
                    height: 60,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.altText || "Gallery"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                <Box className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <TextField
                    size="small"
                    placeholder="Caption"
                    value={item.caption}
                    onChange={(e) => updateItem(item._tempId, { caption: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    placeholder="Alt text (for accessibility)"
                    value={item.altText}
                    onChange={(e) => updateItem(item._tempId, { altText: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                    fullWidth
                  />
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeItem(item._tempId)}
                  aria-label="Remove image"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )}
        />
      )}

      {items.length < maxItems && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
          onClick={() => setPickerOpen(true)}
          className="mt-3"
        >
          Add image
        </Button>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addImage}
        title="Select an image to add"
      />
    </Box>
  );
}
