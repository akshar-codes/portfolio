import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AllInboxOutlinedIcon from "@mui/icons-material/AllInboxOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "sonner";

import RequirePermission from "../auth/RequirePermission";
import { PERMISSIONS } from "../../constants/permissions";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useMediaFoldersQuery, useDeleteMediaFolder } from "../../hooks/useMediaFolders";
import FolderFormDialog from "./FolderFormDialog";

// Mirrors the backend's protected default bucket
// (MEDIA_DEFAULT_FOLDER in backend/src/constants/index.js) — it can
// neither be renamed nor deleted, so its menu is hidden entirely
// rather than relying solely on the server-side 400 to communicate that.
const PROTECTED_FOLDER_SLUG = "general";

export default function FolderSidebar({ activeFolder, onSelectFolder, showTrash, onSelectTrash }) {
  const { data: folders = [], isLoading } = useMediaFoldersQuery();
  const { mutateAsync: deleteFolder } = useDeleteMediaFolder();
  const confirm = useConfirmDialog();

  const [formDialog, setFormDialog] = useState(null); // { mode: 'add' | 'edit', folder? }
  const [menuState, setMenuState] = useState(null); // { anchorEl, folder }

  const handleDelete = async (folder) => {
    setMenuState(null);
    const confirmed = await confirm({
      title: `Delete "${folder.name}"?`,
      description: "Files in this folder must be moved or deleted first.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteFolder(folder._id);
      if (activeFolder === folder.slug) onSelectFolder("");
      toast.success(`Folder "${folder.name}" deleted.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Box sx={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Box className="flex items-center justify-between px-1 mb-1">
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          Folders
        </Typography>
        <RequirePermission permission={PERMISSIONS.MEDIA_MANAGE_FOLDERS}>
          <IconButton size="small" onClick={() => setFormDialog({ mode: "add" })} aria-label="Add folder">
            <AddIcon fontSize="small" />
          </IconButton>
        </RequirePermission>
      </Box>

      <List disablePadding dense>
        <ListItemButton
          selected={!showTrash && !activeFolder}
          onClick={() => onSelectFolder("")}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AllInboxOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13 }}>All files</ListItemText>
        </ListItemButton>

        {!isLoading &&
          folders.map((folder) => (
            <ListItemButton
              key={folder._id}
              selected={!showTrash && activeFolder === folder.slug}
              onClick={() => onSelectFolder(folder.slug)}
              sx={{ borderRadius: 2, pr: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <FolderOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 13, noWrap: true }} sx={{ minWidth: 0 }}>
                {folder.name}
              </ListItemText>
              <Chip label={folder.mediaCount ?? 0} size="small" sx={{ height: 18, fontSize: 10, mr: 0.5 }} />
              {folder.slug !== PROTECTED_FOLDER_SLUG && (
                <RequirePermission permission={PERMISSIONS.MEDIA_MANAGE_FOLDERS}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuState({ anchorEl: e.currentTarget, folder });
                    }}
                    aria-label={`Folder options for ${folder.name}`}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </RequirePermission>
              )}
            </ListItemButton>
          ))}

        <ListItemButton selected={showTrash} onClick={onSelectTrash} sx={{ borderRadius: 2, mt: 1 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Trash</ListItemText>
        </ListItemButton>
      </List>

      <Menu anchorEl={menuState?.anchorEl} open={!!menuState} onClose={() => setMenuState(null)}>
        <MenuItem onClick={() => setFormDialog({ mode: "edit", folder: menuState.folder })}>Rename</MenuItem>
        <MenuItem onClick={() => handleDelete(menuState.folder)} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>

      <FolderFormDialog
        open={!!formDialog}
        mode={formDialog?.mode}
        folder={formDialog?.folder}
        onClose={() => setFormDialog(null)}
      />
    </Box>
  );
}
