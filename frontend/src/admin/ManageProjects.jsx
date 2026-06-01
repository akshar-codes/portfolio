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

function moveItem(arr, index, direction) {
  const next = index + direction;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

function ReorderButtons({ index, total, onMove, disabled }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <button
        className="btn btn--ghost"
        onClick={() => onMove(index, -1)}
        disabled={index === 0 || disabled}
        aria-label="Move up"
        style={{ height: 28, padding: "0 10px", fontSize: 12 }}
      >
        ↑
      </button>
      <button
        className="btn btn--ghost"
        onClick={() => onMove(index, 1)}
        disabled={index === total - 1 || disabled}
        aria-label="Move down"
        style={{ height: 28, padding: "0 10px", fontSize: 12 }}
      >
        ↓
      </button>
    </div>
  );
}

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [localProjects, setLocalProjects] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchProjects = useCallback(async (targetPage = 1) => {
    setStatus("loading");
    setError("");
    setLocalProjects(null);
    try {
      const { data } = await api.get("/projects", {
        params: { page: targetPage, limit: PAGE_SIZE },
      });
      const sorted = [...(data.projects ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      setProjects(sorted);
      setLocalProjects(sorted);
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

  /* ── Reorder ────────────────────────────────────────────────────── */
  const handleMove = (index, direction) => {
    setLocalProjects((prev) => moveItem(prev, index, direction));
  };

  const handleSaveOrder = async () => {
    if (!localProjects) return;
    setSavingOrder(true);
    try {
      await api.patch("/projects/reorder", {
        orderedIds: localProjects.map((p) => p._id),
      });
      setProjects(localProjects);
      toast.success("Project order saved.");
    } catch (err) {
      toast.error(err.message);
      setLocalProjects(projects);
    } finally {
      setSavingOrder(false);
    }
  };

  /* Dirty check: compare ID sequence against server-confirmed array */
  const orderDirty =
    !savingOrder &&
    localProjects !== null &&
    localProjects.some((p, i) => projects[i]?._id !== p._id);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const displayProjects = localProjects ?? projects;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Projects</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {orderDirty && (
            <button
              className="btn btn--ghost"
              onClick={handleSaveOrder}
              disabled={savingOrder}
            >
              {savingOrder ? "Saving…" : "Save Order"}
            </button>
          )}
          <Link to="/admin/projects/new" className="btn btn--primary">
            + Add Project
          </Link>
        </div>
      </div>

      {/* Helper note — only when there are projects to reorder */}
      {status === "ready" && displayProjects.length > 1 && (
        <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -8 }}>
          Use ↑ ↓ to reorder, then click <strong>Save Order</strong>.
        </p>
      )}

      {status === "loading" && <AdminSkeleton rows={4} />}

      {status === "error" && (
        <AdminError message={error} onRetry={() => fetchProjects(page)} />
      )}

      {status === "ready" && displayProjects.length === 0 && (
        <AdminEmpty
          icon="🗂️"
          title="No projects yet"
          sub="Click Add Project above to publish your first one"
        />
      )}

      {status === "ready" && displayProjects.length > 0 && (
        <>
          <ul className="admin-list" aria-label="Portfolio projects">
            {displayProjects.map((project, index) => (
              <li
                key={project._id}
                className="admin-item"
                style={{ alignItems: "flex-start", padding: "14px 18px" }}
              >
                {/* Reorder arrows */}
                <ReorderButtons
                  index={index}
                  total={displayProjects.length}
                  onMove={handleMove}
                  disabled={savingOrder}
                />

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
                    <span
                      className="admin-item__badge"
                      style={{
                        background: "transparent",
                        color: "var(--a-text-dim)",
                        borderColor: "var(--a-border)",
                        fontSize: 10,
                      }}
                    >
                      #{index + 1}
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
                    disabled={savingOrder}
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
                disabled={page === 1 || savingOrder}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: "var(--a-text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn--ghost"
                onClick={() => fetchProjects(page + 1)}
                disabled={page === totalPages || savingOrder}
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
