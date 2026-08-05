import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "sonner";

import TagInput from "../common/TagInput";
import { getPreviewUrl } from "../../utils/cloudinaryTransform";
import { downloadMediaBatch } from "../../utils/downloadFiles";
import { useUpdateMediaMetadata, useReplaceMedia, useDeleteMedia } from "../../hooks/useMediaLibrary";
import { useMediaFoldersQuery } from "../../hooks/useMediaFolders";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Right-anchored details panel opened when a grid item is clicked.
 * Owns the metadata edit form (alt text / caption / tags / folder) and
 * the per-item destructive/utility actions (replace, copy URL,
 * download, move to trash). All mutations go through the shared
 * hooks/useMediaLibrary.js set, so the grid's cache invalidates the
 * same way regardless of which surface triggered the change.
 */
export default function MediaDetailsDrawer({ open, media, onClose, onDeleted }) {
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [folder, setFolder] = useState("general");

  const { data: folders = [] } = useMediaFoldersQuery();
  const { mutateAsync: updateMetadata, isPending: saving } = useUpdateMediaMetadata();
  const { mutateAsync: replaceMedia, isPending: replacing } = useReplaceMedia();
  const { mutateAsync: deleteMedia, isPending: deleting } = useDeleteMedia();

  useEffect(() => {
    if (media) {
      setAltText(media.altText ?? "");
      setCaption(media.caption ?? "");
      setTags(media.tags ?? []);
      setFolder(media.folder ?? "general");
    }
  }, [media]);

  if (!media) return null;

  const isDirty =
    altText !== (media.altText ?? "") ||
    caption !== (media.caption ?? "") ||
    folder !== (media.folder ?? "general") ||
    JSON.stringify(tags) !== JSON.stringify(media.tags ?? []);

  const handleSave = async () => {
    try {
      await updateMetadata({ id: media._id, payload: { altText, caption, tags, folder } });
      toast.success("Media details updated.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      await replaceMedia({ id: media._id, formData: fd });
      toast.success("Image replaced. Anything referencing the old URL by value will need re-selecting.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      toast.success("Image URL copied to clipboard.");
    } catch {
      toast.error("Could not copy URL.");
    }
  };

  const handleDownload = async () => {
    const { failed } = await downloadMediaBatch([media]);
    if (failed > 0) toast.error("Download failed.");
  };

  const handleDelete = async () => {
    if (!window.confirm(`Move "${media.originalName}" to trash?`)) return;
    try {
      await deleteMedia(media._id);
      toast.success("Moved to trash.");
      onDeleted?.(media);
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {media.originalName}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "action.hover", aspectRatio: "4 / 3" }}>
            <img
              src={getPreviewUrl(media.url, 800)}
              alt={media.altText || media.originalName}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          <Box className="flex items-center gap-2 flex-wrap">
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon fontSize="small" />} onClick={handleCopyUrl}>
              Copy URL
            </Button>
            <Button size="small" variant="outlined" startIcon={<DownloadOutlinedIcon fontSize="small" />} onClick={handleDownload}>
              Download
            </Button>
            <Button component="label" size="small" variant="outlined" disabled={replacing}>
              {replacing ? "Replacing…" : "Replace file"}
              <input type="file" accept="image/*" hidden onChange={handleReplace} />
            </Button>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {formatBytes(media.bytes)} · {media.width}×{media.height} · {media.format?.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Uploaded{" "}
              {new Date(media.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Box>

          <TextField
            label="Alt text"
            size="small"
            fullWidth
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            helperText="Describes the image for accessibility and SEO."
          />

          <TextField
            label="Caption"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />

          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>
              Folder
            </Typography>
            <Box className="flex flex-wrap gap-1.5">
              <Chip
                label="General"
                size="small"
                onClick={() => setFolder("general")}
                color={folder === "general" ? "primary" : "default"}
                variant={folder === "general" ? "filled" : "outlined"}
              />
              {folders
                .filter((f) => f.slug !== "general")
                .map((f) => (
                  <Chip
                    key={f._id}
                    label={f.name}
                    size="small"
                    onClick={() => setFolder(f.slug)}
                    color={folder === f.slug ? "primary" : "default"}
                    variant={folder === f.slug ? "filled" : "outlined"}
                  />
                ))}
            </Box>
          </Box>

          <TagInput
            id={`media-tags-${media._id}`}
            label="Tags"
            placeholder="Press Enter to add"
            items={tags}
            onChange={setTags}
            maxItems={20}
          />
        </Box>

        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1.5 }}>
          <Button
            color="error"
            variant="text"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Trash"}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isDirty || saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
