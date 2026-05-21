import { useEffect, useState } from "react";
import api from "../services/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/messages");
      console.log(data);
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  return (
    <article className="admin active">
      <header>
        <h2 className="h2 article-title">Messages</h2>
      </header>

      {loading && <p>Loading messages...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && messages.length === 0 && !error && <p>No messages found.</p>}

      <ul className="admin-list">
        {messages.map((msg) => (
          <li key={msg._id} className="admin-list-item">
            <div className="admin-project-content">
              <div className="admin-message-header">
                <h4 className="admin-title">{msg.fullname}</h4>
                <span className="admin-email">{msg.email}</span>
              </div>
              <p className="admin-message-text">
                {msg.message?.slice(0, 120)}
                {msg.message?.length > 120 && "..."}
              </p>
              <small className="admin-date">
                {msg.createdAt ? new Date(msg.createdAt).toDateString() : ""}
              </small>
            </div>
            <button
              className="danger-btn"
              onClick={() => deleteMessage(msg._id, msg.fullname)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
