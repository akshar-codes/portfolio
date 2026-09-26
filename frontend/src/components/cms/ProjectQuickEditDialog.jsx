import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { toast } from "sonner";
import { projectsApi } from "../../api/projectsApi";

export default function ProjectQuickEditDialog({ project, categories, onClose, onSaved }) {
  const [category, setCategory] = useState(project.category?._id ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!category) return;
    setSaving(true);
    try {
      const form = new FormData(); form.append("category", category);
      await projectsApi.update(project._id, form);
      toast.success("Project category updated."); onSaved(); onClose();
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };
  return <Dialog open onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Quick edit: {project.title}</DialogTitle>
    <DialogContent dividers>
      <TextField select fullWidth size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((entry) => <MenuItem key={entry._id} value={entry._id}>{entry.name}</MenuItem>)}
      </TextField>
    </DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" onClick={save} disabled={saving || !category}>{saving ? "Saving…" : "Save"}</Button></DialogActions>
  </Dialog>;
}
