import Drawer from "@mui/material/Drawer";
import Sidebar from "./Sidebar";

export const SIDEBAR_WIDTH = 260;

/**
 * Mobile/tablet host for the sidebar. Kept separate from Sidebar itself
 * so the desktop permanent rail (a plain sticky Box in AdminLayout) and
 * this temporary MUI Drawer both render the exact same nav content
 * without either owning positioning logic that the other doesn't need.
 */
export default function MobileDrawer({ open, onClose }) {
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
      }}
    >
      <Sidebar onNavigate={onClose} />
    </Drawer>
  );
}
