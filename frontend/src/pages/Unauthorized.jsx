import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ROUTES } from "../../constants/routes";

export default function Unauthorized() {
  return (
    <Box className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <LockOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
      <Typography variant="h5" fontWeight={700}>
        Access restricted
      </Typography>
      <Typography variant="body2" color="text.secondary" className="max-w-sm">
        Your account doesn&apos;t have permission to view this page. If you believe this is a
        mistake, contact whoever manages this portfolio&apos;s admin access.
      </Typography>
      <Button component={Link} to={ROUTES.adminDashboard} variant="contained" sx={{ mt: 1 }}>
        Back to dashboard
      </Button>
    </Box>
  );
}
