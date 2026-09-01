import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import UnpublishedOutlinedIcon from "@mui/icons-material/UnpublishedOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

import ScheduleDialog from "./ScheduleDialog";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_SCHEDULED,
  CONTENT_STATUS_PUBLISHED,
  CONTENT_STATUS_UNPUBLISHED,
  CONTENT_STATUS_ARCHIVED,
  CONTENT_STATUS_TRANSITIONS,
  STATUS_ACTION_LABELS,
} from "../../constants/contentStatus";

const ACTION_ICONS = {
  [CONTENT_STATUS_PUBLISHED]: <PublishOutlinedIcon fontSize="small" />,
  [CONTENT_STATUS_UNPUBLISHED]: <UnpublishedOutlinedIcon fontSize="small" />,
  [CONTENT_STATUS_ARCHIVED]: <ArchiveOutlinedIcon fontSize="small" />,
  [CONTENT_STATUS_DRAFT]: <RestoreOutlinedIcon fontSize="small" />,
  [CONTENT_STATUS_SCHEDULED]: <ScheduleOutlinedIcon fontSize="small" />,
};

// Targets that need an "are you sure?" before firing — taking content
// down or retiring it entirely are the two genuinely destructive-ish
// actions in this workflow. Publishing, scheduling, and restoring to
// draft are all safely reversible, so they fire immediately.
const CONFIRM_TARGETS = new Set([CONTENT_STATUS_UNPUBLISHED, CONTENT_STATUS_ARCHIVED]);

/**
 * @param {{
 *   status: string,
 *   label?: string,
 *   size?: 'small'|'medium',
 *   variant?: 'text'|'outlined'|'contained',
 *   busy?: boolean,
 *   onPublish: () => Promise<void>|void,
 *   onUnpublish: () => Promise<void>|void,
 *   onArchive: () => Promise<void>|void,
 *   onRestore: () => Promise<void>|void,
 *   onSchedule: (publishAtIso: string) => Promise<void>|void,
 *   resourceLabel?: string,
 * }} props
 */
export default function PublishActionsMenu({
  status,
  label = "Actions",
  size = "small",
  variant = "outlined",
  busy = false,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onSchedule,
  resourceLabel = "this content",
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const confirm = useConfirmDialog();

  const allowedTargets = CONTENT_STATUS_TRANSITIONS[status] ?? [];

  const handlerFor = {
    [CONTENT_STATUS_PUBLISHED]: onPublish,
    [CONTENT_STATUS_UNPUBLISHED]: onUnpublish,
    [CONTENT_STATUS_ARCHIVED]: onArchive,
    [CONTENT_STATUS_DRAFT]: onRestore,
  };

  const runTransition = async (target) => {
    setAnchorEl(null);

    if (target === CONTENT_STATUS_SCHEDULED) {
      setScheduleOpen(true);
      return;
    }

    if (CONFIRM_TARGETS.has(target)) {
      const confirmed = await confirm({
        title: `${STATUS_ACTION_LABELS[target]} ${resourceLabel}?`,
        description:
          target === CONTENT_STATUS_ARCHIVED
            ? "Archived content is removed from the active workflow. It can be restored to draft later."
            : "This will immediately remove it from the public site.",
        confirmLabel: STATUS_ACTION_LABELS[target],
        tone: "danger",
      });
      if (!confirmed) return;
    }

    await handlerFor[target]?.();
  };

  const handleScheduleConfirm = async (publishAtIso) => {
    setScheduling(true);
    try {
      await onSchedule(publishAtIso);
      setScheduleOpen(false);
    } finally {
      setScheduling(false);
    }
  };

  if (allowedTargets.length === 0) return null;

  return (
    <>
      <Button
        size={size}
        variant={variant}
        endIcon={busy ? <CircularProgress size={14} color="inherit" /> : <ArrowDropDownIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={busy}
      >
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {allowedTargets.map((target) => (
          <MenuItem key={target} onClick={() => runTransition(target)}>
            <ListItemIcon>{ACTION_ICONS[target]}</ListItemIcon>
            <ListItemText>{STATUS_ACTION_LABELS[target]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => (scheduling ? null : setScheduleOpen(false))}
        onConfirm={handleScheduleConfirm}
        loading={scheduling}
      />
    </>
  );
}
