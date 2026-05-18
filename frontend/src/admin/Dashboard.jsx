import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <article className="admin">
      <header>
        <h2 className="h2 article-title">Admin Dashboard</h2>
      </header>

      <section className="admin-actions">
        <Link to="/admin/projects" className="admin-card">
          <h3>Manage Projects</h3>
          <p>Add, edit or delete portfolio projects</p>
        </Link>

        <Link to="/admin/messages" className="admin-card">
          <h3>Messages</h3>
          <p>View contact form submissions</p>
        </Link>
      </section>
    </article>
  );
}
