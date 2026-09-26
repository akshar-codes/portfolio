import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { toast } from "sonner";
import { useContentVersions, useRestoreContentVersion } from "../../hooks/useContentVersions";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

export default function VersionHistoryDialog({ open, onClose, resource, id, onRestored }) {
  const { data: versions = [], isLoading } = useContentVersions(resource, id, { enabled: open && Boolean(id) });
  const { mutateAsync: restore, isPending } = useRestoreContentVersion(resource, id);
  const confirm = useConfirmDialog();
  const [restoringId, setRestoringId] = useState(null);
  const handleRestore = async (version) => {
    if (!await confirm({ title: "Restore this version?", description: "Current content will be saved to history before this version is restored.", confirmLabel: "Restore" })) return;
    setRestoringId(version._id);
    try { await restore(version._id); onRestored?.(); toast.success("Version restored."); onClose(); }
    catch (error) { toast.error(error.message); }
    finally { setRestoringId(null); }
  };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Version history</DialogTitle>
    <DialogContent dividers>
      {isLoading ? <Typography>Loading history…</Typography> : versions.length === 0 ? <Typography color="text.secondary">No previous versions yet.</Typography> :
        <List>{versions.map((version) => <ListItem key={version._id} divider secondaryAction={<Button size="small" disabled={isPending} onClick={() => handleRestore(version)}>{restoringId === version._id ? "Restoring…" : "Restore"}</Button>}>
          <ListItemText primary={new Date(version.createdAt).toLocaleString()} secondary={<Stack direction="row" spacing={1}><span>{version.resource}</span><span>Before change</span></Stack>} />
        </ListItem>)}</List>}
    </DialogContent>
  </Dialog>;
}
