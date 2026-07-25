import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import Breadcrumbs from "./Breadcrumbs";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { ROUTES } from "../../constants/routes";

export default function Header({ onMenuClick, pageTitle }) {
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await api.post(API_ENDPOINTS.adminLogout);
    } catch {
      // Proceed with client-side logout regardless — an expired or
      // already-invalid session cookie means server-side state is gone too.
    } finally {
      logout();
      navigate(ROUTES.adminLogin);
    }
  };

  const initial = (admin?.username?.[0] ?? "A").toUpperCase();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton onClick={onMenuClick} edge="start" sx={{ display: { md: "none" } }} aria-label="Open navigation menu">
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {pageTitle}
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Breadcrumbs />
          </Box>
        </Box>

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Account menu"
          aria-controls={anchorEl ? "admin-account-menu" : undefined}
          aria-haspopup="true"
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14, fontWeight: 700 }}>
            {initial}
          </Avatar>
        </IconButton>
        <Menu
          id="admin-account-menu"
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Typography variant="body2" fontWeight={600}>
              {admin?.username ?? "Signed in"}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
