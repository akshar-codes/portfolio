import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMessageSummaryQuery } from "../../hooks/useMessages";
import { ROUTES } from "../../constants/routes";

/**
 * Renders nothing — watches the unread-message count via the shared,
 * polled summary query (see hooks/useMessages.js useMessageSummaryQuery)
 * and surfaces a toast whenever it increases while the admin is active
 * in the panel. Mounted once in AdminLayout so every other consumer of
 * useMessageSummaryQuery (the Sidebar badge, the Dashboard widget)
 * shares that same query/interval instead of each triggering its own
 * duplicate network request.
 *
 * The baseline is only established after the first successful fetch —
 * a pre-existing backlog of unread messages at login never triggers a
 * toast, only a genuine increase after that baseline does.
 */
export default function MessageNotificationWatcher() {
  const navigate = useNavigate();
  const { data } = useMessageSummaryQuery();
  const previousUnreadRef = useRef(null);

  useEffect(() => {
    if (!data || typeof data.unreadCount !== "number") return;
    const { unreadCount } = data;

    if (previousUnreadRef.current === null) {
      previousUnreadRef.current = unreadCount;
      return;
    }

    if (unreadCount > previousUnreadRef.current) {
      const newCount = unreadCount - previousUnreadRef.current;
      toast.message(
        newCount === 1 ? "New message received" : `${newCount} new messages received`,
        {
          description: "Click to view your inbox.",
          action: {
            label: "View",
            onClick: () => navigate(ROUTES.adminMessages),
          },
        },
      );
    }

    previousUnreadRef.current = unreadCount;
  }, [data, navigate]);

  return null;
}
