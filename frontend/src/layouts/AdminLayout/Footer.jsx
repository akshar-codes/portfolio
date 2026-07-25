import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-4"
      sx={{ borderTop: "1px solid", borderColor: "divider" }}
    >
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} Portfolio Admin
      </Typography>
      <Typography
        component={Link}
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        variant="caption"
        className="flex items-center gap-1"
        sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
      >
        View live site <OpenInNewIcon sx={{ fontSize: 14 }} />
      </Typography>
    </Box>
  );
}
