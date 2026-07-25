import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { ROUTES } from "../../constants/routes";

export default function NotFound() {
  return (
    <Box className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <SearchOffOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
      <Typography variant="h5" fontWeight={700}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" className="max-w-sm">
        The admin page you&apos;re looking for doesn&apos;t exist or may have moved.
      </Typography>
      <Button component={Link} to={ROUTES.adminDashboard} variant="contained" sx={{ mt: 1 }}>
        Back to dashboard
      </Button>
    </Box>
  );
}
