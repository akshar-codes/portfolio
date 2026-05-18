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

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`);

      // Refresh after delete
      fetchMessages();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete message");
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
              onClick={() => deleteMessage(msg._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
