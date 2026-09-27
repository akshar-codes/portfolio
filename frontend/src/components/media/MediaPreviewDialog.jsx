import { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Button from "@mui/material/Button";
import { downloadMediaBatch } from "../../utils/downloadFiles";
import { getWebpUrl } from "../../utils/cloudinaryTransform";

export default function MediaPreviewDialog({ open, media, mediaItems = [], onNavigate, onClose }) {
  const [webpMediaId, setWebpMediaId] = useState(null);
  const handleKeys = useCallback((event) => {
    if (!open || !media || !onNavigate || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const index = mediaItems.findIndex((item) => item._id === media._id);
    if (index < 0 || mediaItems.length < 2) return;
    const delta = event.key === "ArrowRight" ? 1 : -1;
    onNavigate(mediaItems[(index + delta + mediaItems.length) % mediaItems.length]);
  }, [open, media, mediaItems, onNavigate]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [handleKeys]);
  if (!media) return null;

  const webp = Boolean(media && webpMediaId === media._id);
  const displayUrl = webp ? getWebpUrl(media.url) : media.url;

  const handleDownload = async () => {
    await downloadMediaBatch([media]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: "transparent",
          boxShadow: "none",
          width: "100%",
          height: "100%",
          margin: 0,
          maxHeight: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        },
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 1, zIndex: 10 }}>
        <Button size="small" variant="contained" onClick={() => setWebpMediaId(webp ? null : media._id)}>{webp ? "Original" : "WebP"}</Button>
        <IconButton
          component="a"
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          size="small"
          aria-label="Open original"
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleDownload}
          sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          size="small"
          aria-label="Download"
        >
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={onClose}
          sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          size="small"
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <img
        src={displayUrl}
        alt={media.altText || media.originalName}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}
      />
      
      {media.caption && (
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            color: "white",
            bgcolor: "rgba(0,0,0,0.7)",
            px: 2,
            py: 1,
            borderRadius: 1,
            maxWidth: "80vw",
            textAlign: "center",
          }}
        >
          {media.caption}
        </Typography>
      )}
    </Dialog>
  );
}
