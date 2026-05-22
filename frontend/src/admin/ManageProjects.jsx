import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects ?? []);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  const deleteProject = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis will permanently remove the project and its image.`,
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
  }, [fetchProjects]);

  return (
    <div className="admin-page">
      {/* Header row */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Projects</h2>
        <Link to="/admin/projects/new" className="btn btn--primary">
          + Add Project
        </Link>
      </div>

      {/* States */}
      {status === "loading" && <AdminSkeleton rows={4} />}

      {status === "error" && (
        <AdminError message={error} onRetry={fetchProjects} />
      )}

      {status === "ready" && projects.length === 0 && (
        <AdminEmpty
          icon="🗂️"
          title="No projects yet"
          sub="Click Add Project above to publish your first one"
        />
      )}

      {/* List */}
      {status === "ready" && projects.length > 0 && (
        <ul className="admin-list" aria-label="Portfolio projects">
          {projects.map((project) => (
            <li key={project._id} className="admin-item">
              <img
                className="admin-item__thumb"
                src={project.image?.url || "/images/placeholder.png"}
                alt={project.title}
                loading="lazy"
              />

              <div className="admin-item__body">
                <span className="admin-item__name">{project.title}</span>
                <div className="admin-item__meta">
                  <span className="admin-item__badge">{project.category}</span>
                </div>
                <span className="admin-item__preview">
                  {project.description?.slice(0, 90)}
                  {project.description?.length > 90 && "…"}
                </span>
              </div>

              <div className="admin-item__actions">
                <button
                  className="btn btn--danger"
                  onClick={() => deleteProject(project._id, project.title)}
                  aria-label={`Delete project ${project.title}`}
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
