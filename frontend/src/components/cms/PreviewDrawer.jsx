import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";

import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import DesktopMacIcon from "@mui/icons-material/DesktopMac";

export default function PreviewDrawer({ open, onClose, previewUrl, title }) {
  const [viewport, setViewport] = useState("desktop");

  const handleViewportChange = (event, newViewport) => {
    if (newViewport !== null) {
      setViewport(newViewport);
    }
  };

  const iframeWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", md: "min(1200px, 80vw)" },
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6">{title || "Preview"}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewport}
            exclusive
            onChange={handleViewportChange}
            size="small"
            aria-label="Viewport size"
          >
            <ToggleButton value="mobile" aria-label="Mobile preview">
              <Tooltip title="Mobile">
                <PhoneIphoneIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="tablet" aria-label="Tablet preview">
              <Tooltip title="Tablet">
                <TabletMacIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="desktop" aria-label="Desktop preview">
              <Tooltip title="Desktop">
                <DesktopMacIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Open in new tab">
            <IconButton
              component="a"
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} edge="end" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          bgcolor: "var(--bg-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: viewport === "desktop" ? 0 : 4,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            width: iframeWidths[viewport],
            height: "100%",
            maxWidth: "100%",
            transition: "width 0.3s ease",
            boxShadow: viewport !== "desktop" ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
            borderRadius: viewport !== "desktop" ? "12px" : 0,
            overflow: "hidden",
            border: viewport !== "desktop" ? "1px solid var(--border)" : "none",
          }}
        >
          {open && (
            <iframe
              src={previewUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                backgroundColor: "var(--bg-primary)",
              }}
              title="Preview"
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
