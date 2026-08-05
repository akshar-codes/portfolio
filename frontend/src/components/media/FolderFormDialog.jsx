import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "sonner";

import { useCreateMediaFolder, useRenameMediaFolder } from "../../hooks/useMediaFolders";

export default function FolderFormDialog({ open, mode, folder, onClose }) {
  const [name, setName] = useState("");
  const { mutateAsync: createFolder, isPending: creating } = useCreateMediaFolder();
  const { mutateAsync: renameFolder, isPending: renaming } = useRenameMediaFolder();

  useEffect(() => {
    if (open) setName(mode === "edit" ? folder?.name ?? "" : "");
  }, [open, mode, folder]);

  const saving = creating || renaming;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      if (mode === "edit") {
        await renameFolder({ id: folder._id, name: trimmed });
        toast.success("Folder renamed.");
      } else {
        await createFolder(trimmed);
        toast.success("Folder created.");
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={700}>{mode === "edit" ? "Rename folder" : "New folder"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 60 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
