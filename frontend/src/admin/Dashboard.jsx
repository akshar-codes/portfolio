import { Link } from "react-router-dom";

const ACTIONS = [
  {
    to: "/admin/projects",
    icon: "🗂️",
    title: "Manage Projects",
    desc: "Add, view, or delete portfolio projects and their images.",
  },
  {
    to: "/admin/categories",
    icon: "🏷️",
    title: "Manage Categories",
    desc: "Create or remove project categories. Unused categories can be deleted.",
  },
  {
    to: "/admin/messages",
    icon: "💬",
    title: "Messages",
    desc: "Read and manage contact form submissions from visitors.",
  },
  {
    to: "/admin/resume",
    icon: "📄",
    title: "Edit Resume",
    desc: "Update education history and technical skills displayed on your resume page.",
  },
];

export default function Dashboard() {
  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Dashboard</h2>
      </div>

      {/* Welcome */}
      <p style={{ fontSize: 14, color: "var(--a-text-muted)", marginTop: -8 }}>
        Welcome back. Here&apos;s what you can manage today.
      </p>

      {/* Cards */}
      <div className="admin-card-grid">
        {ACTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="admin-action-card">
            <span className="admin-action-card__icon">{item.icon}</span>
            <span className="admin-action-card__title">{item.title}</span>
            <span className="admin-action-card__desc">{item.desc}</span>
            <span className="admin-action-card__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
