import { Link as RouterLink } from "react-router-dom";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";

export default function Breadcrumbs() {
  const trail = useBreadcrumbs();

  return (
    <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
      {trail.map((crumb, index) => {
        const isLast = index === trail.length - 1;
        return isLast ? (
          <Typography key={crumb.path} color="text.primary" fontSize={13} fontWeight={600}>
            {crumb.label}
          </Typography>
        ) : (
          <Link key={crumb.path} component={RouterLink} to={crumb.path} underline="hover" color="inherit" fontSize={13}>
            {crumb.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
