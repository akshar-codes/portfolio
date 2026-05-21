import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/projects");
      setProjects(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis will permanently remove the project and its image. This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <article className="admin">
      <header className="admin-header">
        <h2 className="h2 article-title">Projects</h2>
        <Link to="/admin/projects/new" className="form-btn">
          + Add Project
        </Link>
      </header>

      {loading && <p>Loading projects...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && projects.length === 0 && !error && <p>No projects found.</p>}

      <ul className="admin-list">
        {projects.map((project) => (
          <li key={project._id} className="admin-list-item">
            <img
              className="admin-thumb"
              src={project.image.url}
              alt={project.title}
            />
            <div className="admin-project-content">
              <h4 className="admin-title">{project.title}</h4>
              <p className="admin-description">
                {project.description.slice(0, 80)}...
              </p>
            </div>
            <button
              className="danger-btn"
              onClick={() => deleteProject(project._id, project.title)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
