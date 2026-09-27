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
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import PasswordIcon from "@mui/icons-material/Password";
import { toast } from "sonner";

import Breadcrumbs from "./Breadcrumbs";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { ROUTES } from "../../constants/routes";

export default function Header({ onMenuClick, pageTitle, menuOpen = false }) {
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const closePasswordDialog = () => {
    if (changingPassword) return;
    setPasswordDialogOpen(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch(API_ENDPOINTS.adminChangePassword, passwordForm);
      toast.success("Password changed successfully.");
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

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
        <IconButton onClick={onMenuClick} edge="start" sx={{ display: { md: "none" } }} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="admin-mobile-navigation">
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

        <Tooltip title="Search (Ctrl+K)">
          <IconButton
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            aria-label="Global search"
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>

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
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setPasswordDialogOpen(true);
            }}
          >
            <ListItemIcon>
              <PasswordIcon fontSize="small" />
            </ListItemIcon>
            Change password
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>

      <Dialog open={passwordDialogOpen} onClose={closePasswordDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handlePasswordChange}>
          <DialogTitle>Change admin password</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
            <TextField
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))}
              inputProps={{ minLength: 12, maxLength: 72 }}
              helperText="Use at least 12 characters."
              required
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))}
              inputProps={{ minLength: 12, maxLength: 72 }}
              required
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={closePasswordDialog} disabled={changingPassword}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={changingPassword}>
              {changingPassword ? "Changing…" : "Change password"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppBar>
  );
}
