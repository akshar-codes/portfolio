import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function PreviewBanner({ backUrl, title }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        bgcolor: "warning.main",
        color: "warning.contrastText",
        px: 3,
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        ⚠ Preview mode — this content is not yet published
      </Typography>
      {backUrl && (
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<ArrowBackIcon />}
          href={backUrl}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Back to {title || "Admin"}
        </Button>
      )}
    </Box>
  );
}
