import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

/** Formats a Date as the value a `datetime-local` input expects (local time, no timezone/seconds). */
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Default the picker one hour ahead, so the initial value is always
// a valid ("must be future") default rather than "now" (which would
// almost always have already elapsed by submit time).
function defaultValue() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return toLocalInputValue(d);
}

/**
 * Confirmation-style dialog for the "Schedule" publish action. Uses a
 * native `datetime-local` input (via MUI TextField) rather than
 * @mui/x-date-pickers, to avoid adding a dependency for a single field.
 *
 * @param {{
 *   open: boolean,
 *   title?: string,
 *   onClose: () => void,
 *   onConfirm: (publishAtIso: string) => Promise<void> | void,
 *   loading?: boolean,
 * }} props
 */
export default function ScheduleDialog({
  open,
  title = "Schedule publish",
  onClose,
  onConfirm,
  loading = false,
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setError("Please choose a valid date and time.");
      return;
    }
    if (date.getTime() <= Date.now()) {
      setError("Scheduled time must be in the future.");
      return;
    }
    setError("");
    await onConfirm(date.toISOString());
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Choose when this content should automatically go live. It will remain hidden from the
          public site until then.
        </DialogContentText>
        <TextField
          type="datetime-local"
          label="Publish at"
          fullWidth
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error || " "}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? "Scheduling…" : "Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
