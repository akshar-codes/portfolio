import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import ReportOffOutlinedIcon from "@mui/icons-material/ReportOffOutlined";

import { getInitials } from "../../utils/strings";

function formatFullDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Right-anchored details panel for a single contact-form message.
 * Mirrors components/media/MediaDetailsDrawer.jsx's structure — pure
 * presentation, every mutation reported back to the caller via
 * callbacks so ManageMessages.jsx owns confirmation dialogs, toasts,
 * and cache invalidation exactly once regardless of whether the
 * action was triggered from a table row or from this drawer.
 *
 * `onToggleRead` / `onToggleArchive` / `onToggleSpam` each receive the
 * full `message` object and are expected to decide the target state
 * themselves (mirrors ManageMessages.jsx's row-action handlers, which
 * already do this) — the drawer never encodes "next status" logic
 * itself, it only reflects `message`'s current state in its labels.
 */
export default function MessageDetailsDrawer({
  open,
  message,
  onClose,
  onToggleRead,
  onToggleArchive,
  onToggleSpam,
  onDelete,
  onSendReply,
  sendingReply = false,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("Re: Your message via my portfolio");
  const [replyBody, setReplyBody] = useState("");

  if (!message) return null;

  const isUnread = message.status === "unread";

  const handleToggleRead = () => onToggleRead(message);
  const handleToggleArchive = () => onToggleArchive(message);
  const handleToggleSpam = () => onToggleSpam(message);
  const handleDelete = () => onDelete(message);

  const mailtoHref = `mailto:${message.email}?subject=${encodeURIComponent(replySubject)}`;

  const handleSendReply = async (event) => {
    event.preventDefault();
    const sent = await onSendReply(message, { subject: replySubject, body: replyBody });
    if (sent) {
      setReplyBody("");
      setReplyOpen(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 420 }, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Message details
          </Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Sender info */}
          <Box className="flex items-start gap-3">
            <Avatar sx={{ width: 44, height: 44, bgcolor: "primary.main" }}>
              {getInitials(message.fullname)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontWeight={700} noWrap>
                {message.fullname}
              </Typography>
              <Typography
                component="a"
                href={`mailto:${message.email}`}
                variant="body2"
                color="primary.main"
                sx={{ textDecoration: "none", display: "block" }}
                noWrap
              >
                {message.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFullDate(message.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Flags */}
          <Box className="flex items-center gap-1.5 flex-wrap">
            <Chip
              size="small"
              variant={isUnread ? "filled" : "outlined"}
              color={isUnread ? "primary" : "default"}
              label={isUnread ? "Unread" : "Read"}
            />
            {message.isArchived && <Chip size="small" variant="outlined" label="Archived" />}
            {message.isSpam && (
              <Chip size="small" color="error" icon={<ReportOutlinedIcon fontSize="small" />} label="Marked as spam" />
            )}
          </Box>

          <Divider />

          {/* Full message */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1 }}>
              MESSAGE
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {message.message}
            </Typography>
          </Box>

          {/* Spam signals — surfaced for transparency whenever the
           * heuristic detector recorded a non-zero score, even if the
           * message wasn't flagged outright. */}
          {Array.isArray(message.spamReasons) && message.spamReasons.length > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
              }}
            >
              <Typography variant="caption" fontWeight={700} color="error.main" sx={{ display: "block", mb: 0.5 }}>
                Spam signals (score: {message.spamScore ?? 0}/100)
              </Typography>
              <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2 }}>
                {message.spamReasons.map((reason, idx) => (
                  <Typography key={idx} component="li" variant="caption" color="text.secondary">
                    {reason}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {/* Technical metadata */}
          {(message.ipAddress || message.userAgent) && (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.5 }}>
                SUBMISSION METADATA
              </Typography>
              {message.ipAddress && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  IP address: {message.ipAddress}
                </Typography>
              )}
              {message.userAgent && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", wordBreak: "break-word" }}>
                  User agent: {message.userAgent}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<ReplyOutlinedIcon fontSize="small" />}
            component="a"
            href={mailtoHref}
            fullWidth
          >
            Reply via email
          </Button>

          <Button
            variant="outlined"
            startIcon={<ReplyOutlinedIcon fontSize="small" />}
            onClick={() => setReplyOpen((open) => !open)}
            fullWidth
          >
            Reply from website
          </Button>

          {replyOpen && (
            <Box component="form" onSubmit={handleSendReply} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                label="To"
                value={message.email}
                size="small"
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                label="Subject"
                value={replySubject}
                onChange={(event) => setReplySubject(event.target.value)}
                size="small"
                required
                inputProps={{ maxLength: 200 }}
                fullWidth
              />
              <TextField
                label="Your reply"
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                multiline
                minRows={5}
                maxRows={10}
                required
                inputProps={{ maxLength: 10000 }}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Sent from the verified email address configured for this site.
              </Typography>
              <Button type="submit" variant="contained" disabled={sendingReply || !replyBody.trim() || !replySubject.trim()}>
                {sendingReply ? "Sending…" : "Send reply"}
              </Button>
            </Box>
          )}

          <Box className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={isUnread ? <MarkEmailReadOutlinedIcon fontSize="small" /> : <MarkEmailUnreadOutlinedIcon fontSize="small" />}
              onClick={handleToggleRead}
            >
              {isUnread ? "Mark read" : "Mark unread"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={message.isArchived ? <UnarchiveOutlinedIcon fontSize="small" /> : <ArchiveOutlinedIcon fontSize="small" />}
              onClick={handleToggleArchive}
            >
              {message.isArchived ? "Restore" : "Archive"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color={message.isSpam ? "inherit" : "error"}
              startIcon={message.isSpam ? <ReportOffOutlinedIcon fontSize="small" /> : <ReportOutlinedIcon fontSize="small" />}
              onClick={handleToggleSpam}
            >
              {message.isSpam ? "Not spam" : "Mark spam"}
            </Button>
          </Box>

          <Button color="error" variant="text" startIcon={<DeleteOutlineIcon fontSize="small" />} onClick={handleDelete}>
            Delete message
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
