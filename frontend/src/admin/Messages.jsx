import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

const PAGE_SIZE = 10;

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMessages = useCallback(async (targetPage = 1) => {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/messages", {
        params: { page: targetPage, limit: PAGE_SIZE },
      });
      setMessages(data.messages ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setPage(targetPage);
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
      toast.success(`Message from "${fullname}" deleted.`);
      fetchMessages(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Messages</h2>
        {status === "ready" && total > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--a-text)",
              background: "var(--a-surface)",
              border: "1px solid var(--a-border)",
              borderRadius: 100,
              padding: "4px 12px",
            }}
          >
            {total} total
          </span>
        )}
      </div>

      {status === "loading" && <AdminSkeleton rows={5} />}

      {status === "error" && (
        <AdminError message={error} onRetry={() => fetchMessages(page)} />
      )}

      {status === "ready" && messages.length === 0 && (
        <AdminEmpty
          icon="💬"
          title="No messages yet"
          sub="Messages submitted via the contact form will appear here."
        />
      )}

      {status === "ready" && messages.length > 0 && (
        <>
          <ul className="admin-list" aria-label="Contact messages">
            {messages.map((msg) => (
              <li key={msg._id} className="admin-item">
                <div
                  className="admin-item__avatar"
                  aria-hidden="true"
                  title={msg.fullname}
                >
                  {getInitials(msg.fullname)}
                </div>

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

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <button
                className="btn btn--ghost"
                onClick={() => fetchMessages(page - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: "var(--a-text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn--ghost"
                onClick={() => fetchMessages(page + 1)}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
