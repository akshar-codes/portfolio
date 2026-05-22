import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

/** Returns the first letter(s) of a name for the avatar */
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Simple relative time — "2 days ago", "just now", etc. */
function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/messages");
      setMessages(data.messages ?? []);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  const deleteMessage = async (id, fullname) => {
    const confirmed = window.confirm(
      `Delete message from "${fullname}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await api.delete(`/messages/${id}`);
      fetchMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Messages</h2>
        {status === "ready" && messages.length > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--a-text-muted)",
              background: "var(--a-surface)",
              border: "1px solid var(--a-border)",
              borderRadius: 100,
              padding: "4px 12px",
            }}
          >
            {messages.length} total
          </span>
        )}
      </div>

      {/* States */}
      {status === "loading" && <AdminSkeleton rows={5} />}

      {status === "error" && (
        <AdminError message={error} onRetry={fetchMessages} />
      )}

      {status === "ready" && messages.length === 0 && (
        <AdminEmpty
          icon="💬"
          title="No messages yet"
          sub="Messages submitted via the contact form will appear here."
        />
      )}

      {/* List */}
      {status === "ready" && messages.length > 0 && (
        <ul className="admin-list" aria-label="Contact messages">
          {messages.map((msg) => (
            <li key={msg._id} className="admin-item">
              {/* Avatar */}
              <div
                className="admin-item__avatar"
                aria-hidden="true"
                title={msg.fullname}
              >
                {getInitials(msg.fullname)}
              </div>

              {/* Body */}
              <div className="admin-item__body">
                <span className="admin-item__name">{msg.fullname}</span>
                <div className="admin-item__meta">
                  <a
                    href={`mailto:${msg.email}`}
                    style={{
                      color: "var(--a-text-muted)",
                      textDecoration: "none",
                      fontSize: 12,
                    }}
                  >
                    {msg.email}
                  </a>
                  <span style={{ color: "var(--a-text-dim)" }}>·</span>
                  <span className="admin-item__date">
                    {relativeTime(msg.createdAt)}
                  </span>
                </div>
                <span className="admin-item__preview">
                  {msg.message?.slice(0, 110)}
                  {msg.message?.length > 110 && "…"}
                </span>
              </div>

              {/* Actions */}
              <div className="admin-item__actions">
                <button
                  className="btn btn--danger"
                  onClick={() => deleteMessage(msg._id, msg.fullname)}
                  aria-label={`Delete message from ${msg.fullname}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
