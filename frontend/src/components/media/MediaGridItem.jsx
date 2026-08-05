import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "sonner";

import { getThumbnailUrl } from "../../utils/cloudinaryTransform";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Single card in the Media Library grid. Presentation-only — every
 * action (select, open details, restore, delete, download) is
 * reported back to the caller via callbacks, matching this codebase's
 * DataTable/DragReorderList convention of fully-controlled list items.
 */
export default function MediaGridItem({
  item,
  selected = false,
  onToggleSelect,
  onOpenDetails,
  isTrash = false,
  onRestore,
  onDelete,
  onDownload,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleCopyUrl = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("Image URL copied to clipboard.");
    } catch {
      toast.error("Could not copy URL — please copy it manually.");
    }
  };

  return (
    <Box
      onClick={() => onOpenDetails?.(item)}
      className="group"
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        cursor: onOpenDetails ? "pointer" : "default",
        bgcolor: "background.paper",
        transition: "border-color 0.15s ease",
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "1 / 1", bgcolor: "action.hover" }}>
        {!imgLoaded && <Box sx={{ position: "absolute", inset: 0, bgcolor: "action.hover" }} />}
        <img
          src={getThumbnailUrl(item.url, 320)}
          alt={item.altText || item.originalName}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Selection checkbox */}
        <Checkbox
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleSelect?.(item)}
          icon={
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "2px solid white",
                bgcolor: "rgba(0,0,0,0.35)",
              }}
            />
          }
          checkedIcon={
            <CheckCircleIcon sx={{ color: "primary.main", bgcolor: "white", borderRadius: "50%" }} />
          }
          sx={{ position: "absolute", top: 4, left: 4, p: 0.5 }}
        />

        {/* Hover action bar */}
        <Box
          className="opacity-0 group-hover:opacity-100"
          sx={{
            position: "absolute",
            bottom: 0,
            insetInline: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 0.25,
            p: 0.5,
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            transition: "opacity 0.15s ease",
          }}
        >
          {isTrash ? (
            <>
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(item);
                  }}
                  sx={{ color: "#fff" }}
                >
                  <RestoreOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete permanently">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item);
                  }}
                  sx={{ color: "#fff" }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Copy URL">
                <IconButton size="small" onClick={handleCopyUrl} sx={{ color: "#fff" }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(item);
                  }}
                  sx={{ color: "#fff" }}
                >
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit details">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails?.(item);
                  }}
                  sx={{ color: "#fff" }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Move to trash">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item);
                  }}
                  sx={{ color: "#fff" }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ p: 1 }}>
        <Typography variant="caption" fontWeight={600} noWrap sx={{ display: "block" }}>
          {item.originalName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatBytes(item.bytes)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </Typography>
      </Box>
    </Box>
  );
}
