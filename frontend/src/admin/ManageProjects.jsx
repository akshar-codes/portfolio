import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

const PAGE_SIZE = 10;

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = useCallback(async (targetPage = 1) => {
    setStatus("loading");
    setError("");
    try {
      const { data } = await api.get("/projects", {
        params: { page: targetPage, limit: PAGE_SIZE },
      });
      setProjects(data.projects ?? []);
      setTotalPages(data.totalPages ?? 1);
      setPage(targetPage);
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
      toast.success(`"${title}" deleted successfully.`);
      fetchProjects(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Projects</h2>
        <Link to="/admin/projects/new" className="btn btn--primary">
          + Add Project
        </Link>
      </div>

      {status === "loading" && <AdminSkeleton rows={4} />}

      {status === "error" && (
        <AdminError message={error} onRetry={() => fetchProjects(page)} />
      )}

      {status === "ready" && projects.length === 0 && (
        <AdminEmpty
          icon="🗂️"
          title="No projects yet"
          sub="Click Add Project above to publish your first one"
        />
      )}

      {status === "ready" && projects.length > 0 && (
        <>
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
                    <span className="admin-item__badge">
                      {project.category?.name ?? "—"}
                    </span>
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
                onClick={() => fetchProjects(page - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: "var(--a-text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn--ghost"
                onClick={() => fetchProjects(page + 1)}
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
