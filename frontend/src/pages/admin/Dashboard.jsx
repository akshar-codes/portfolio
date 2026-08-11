import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { ROUTES } from "../../constants/routes";
import { useMessageSummaryQuery } from "../../hooks/useMessages";
import { getInitials, truncate } from "../../utils/strings";
import { relativeTime } from "../../utils/date";

const ACTIONS = [
  {
    to: ROUTES.adminProfile,
    icon: "👤",
    title: "Edit Profile",
    desc: "Update your name, contact details, avatar, and social links.",
  },
  {
    to: ROUTES.adminAbout,
    icon: "📋",
    title: "Edit About",
    desc: "Manage your bio paragraphs and service cards displayed on the About page.",
  },
  {
    to: ROUTES.adminProjects,
    icon: "🗂️",
    title: "Manage Projects",
    desc: "Add, view, or delete portfolio projects and their images.",
  },
  {
    to: ROUTES.adminCategories,
    icon: "🏷️",
    title: "Manage Categories",
    desc: "Create or remove project categories. Unused categories can be deleted.",
  },
  {
    to: ROUTES.adminResume,
    icon: "📄",
    title: "Edit Resume",
    desc: "Update education history and technical skills displayed on your resume page.",
  },
  {
    to: ROUTES.adminMessages,
    icon: "💬",
    title: "Messages",
    desc: "Read and manage contact form submissions from visitors.",
  },
  {
    to: ROUTES.adminSettings,
    icon: "⚙️",
    title: "Site Settings",
    desc: "Logo, favicon, brand colors, announcement bar, contact info, and more.",
  },
];

/**
 * Live preview of the most recent, non-archived, non-spam messages.
 * Each row deep-links to ManageMessages.jsx via `?open=<id>`, which
 * fetches and opens that specific message's details drawer even if
 * it isn't on the currently-loaded table page/filter.
 */
function RecentMessagesWidget() {
  const { data, isLoading, isError } = useMessageSummaryQuery();
  const recent = data?.recent ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box className="flex items-center justify-between mb-3">
        <Typography variant="subtitle1" fontWeight={700}>
          Recent messages
        </Typography>
        {typeof data?.unreadCount === "number" && data.unreadCount > 0 && (
          <Chip size="small" color="primary" label={`${data.unreadCount} unread`} />
        )}
      </Box>

      {isLoading && (
        <Box className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Box>
      )}

      {isError && (
        <Typography variant="body2" color="error">
          Couldn&apos;t load recent messages.
        </Typography>
      )}

      {!isLoading && !isError && recent.length === 0 && (
        <Box className="flex flex-col items-center text-center gap-2 py-6">
          <MailOutlineIcon sx={{ color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No messages yet.
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && recent.length > 0 && (
        <Box className="flex flex-col">
          {recent.map((msg, idx) => (
            <Box key={msg._id}>
              <Box
                component={Link}
                to={`${ROUTES.adminMessages}?open=${msg._id}`}
                className="flex items-start gap-3 py-2.5"
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 13,
                    bgcolor: msg.status === "unread" ? "primary.main" : "action.disabledBackground",
                  }}
                >
                  {getInitials(msg.fullname)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box className="flex items-center justify-between gap-2">
                    <Typography fontWeight={msg.status === "unread" ? 700 : 500} fontSize={13} noWrap>
                      {msg.fullname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {relativeTime(msg.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {truncate(msg.message, 80)}
                  </Typography>
                </Box>
              </Box>
              {idx < recent.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default function Dashboard() {
  const { data: summary } = useMessageSummaryQuery();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Dashboard</h2>
      </div>

      <p style={{ fontSize: 14, color: "var(--light-gray)", marginTop: -8 }}>
        Welcome back. Here&apos;s what you can manage today.
      </p>

      <div className="admin-card-grid">
        {ACTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="admin-action-card" style={{ position: "relative" }}>
            {item.to === ROUTES.adminMessages && summary?.unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "var(--a-danger, #d6534a)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 5px",
                }}
              >
                {summary.unreadCount > 99 ? "99+" : summary.unreadCount}
              </span>
            )}
            <span className="admin-action-card__icon">{item.icon}</span>
            <span className="admin-action-card__title">{item.title}</span>
            <span className="admin-action-card__desc">{item.desc}</span>
            <span className="admin-action-card__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      <Box sx={{ mt: 4 }}>
        <RecentMessagesWidget />
      </Box>
    </div>
  );
}
