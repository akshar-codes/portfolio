import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { downloadMediaBatch } from "../../utils/downloadFiles";

export default function MediaPreviewDialog({ open, media, onClose }) {
  if (!media) return null;

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
        src={media.url}
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
