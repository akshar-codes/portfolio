import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { ADMIN_NAV_TREE } from "../../constants/navigation";
import { usePermissions } from "../../hooks/usePermissions";

function isNodeActive(node, pathname) {
  if (!node.path) return false;
  return node.path === "/admin/dashboard" ? pathname === node.path : pathname.startsWith(node.path);
}

function NavNode({ node, depth, pathname, can, onNavigate }) {
  if (node.hidden || (node.permission && !can(node.permission))) return null;

  const visibleChildren = (node.children ?? []).filter(
    (child) => !child.hidden && (!child.permission || can(child.permission)),
  );
  const active = isNodeActive(node, pathname) || visibleChildren.some((c) => isNodeActive(c, pathname));
  const [open, setOpen] = useState(active);
  const Icon = node.icon;

  if (visibleChildren.length === 0) {
    return (
      <ListItemButton
        component={NavLink}
        to={node.path}
        selected={active}
        onClick={onNavigate}
        sx={{ mx: 1, ml: 1 + depth, borderRadius: 2, mb: 0.5 }}
      >
        {Icon && (
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
        )}
        <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}>
          {node.label}
        </ListItemText>
      </ListItemButton>
    );
  }

  return (
    <>
      <ListItemButton onClick={() => setOpen((p) => !p)} sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}>
        {Icon && (
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
        )}
        <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}>{node.label}</ListItemText>
        {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {visibleChildren.map((child) => (
          <NavNode
            key={child.id}
            node={child}
            depth={depth + 1}
            pathname={pathname}
            can={can}
            onNavigate={onNavigate}
          />
        ))}
      </Collapse>
    </>
  );
}

/**
 * Pure nav-list content — no Drawer/positioning of its own. Rendered
 * directly as a permanent rail on desktop (see AdminLayout) and inside
 * MobileDrawer on small screens, so the two never drift out of sync.
 */
export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const { can } = usePermissions();

  return (
    <Box className="flex flex-col h-full" sx={{ bgcolor: "background.paper" }}>
      <Box className="px-5 py-5">
        <Typography variant="h6" fontWeight={700} color="primary.main">
          Portfolio Admin
        </Typography>
      </Box>
      <Divider />
      <Box className="flex-1 overflow-y-auto py-2">
        <List disablePadding>
          {ADMIN_NAV_TREE.map((node) => (
            <NavNode key={node.id} node={node} depth={0} pathname={location.pathname} can={can} onNavigate={onNavigate} />
          ))}
        </List>
      </Box>
    </Box>
  );
}
