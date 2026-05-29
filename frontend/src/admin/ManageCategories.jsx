import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [fetchError, setFetchError] = useState("");

  // Add-form state — only tracks the input value and submit state now
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  // Track which category row is being deleted for optimistic spinner
  const [deletingId, setDeletingId] = useState(null);

  const nameInputRef = useRef(null);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    setStatus("loading");
    setFetchError("");
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data ?? []);
      setStatus("ready");
    } catch (err) {
      setFetchError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ── Add ────────────────────────────────────────────────────────── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      await api.post("/admin/categories", { name: trimmed });
      setNewName("");
      toast.success("Category created successfully.");
      fetchCategories();
      nameInputRef.current?.focus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────────────── */
  const handleDelete = async (id, name, projectCount) => {
    // Button is disabled when in-use, but guard for race conditions
    if (projectCount > 0) {
      toast.warning(
        `"${name}" is in use by ${projectCount} project${projectCount === 1 ? "" : "s"} and cannot be deleted.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${name}"?\n\nThis action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success(`Category "${name}" deleted.`);
      fetchCategories();
    } catch (err) {
      // err.errorCode === "CATEGORY_IN_USE" arrives here on race conditions
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="admin-page">
      {/* Header ---------------------------------------------------- */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Categories</h2>
        {status === "ready" && (
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
            {categories.length} total
          </span>
        )}
      </div>

      {/* Add form --------------------------------------------------- */}
      <div
        style={{
          background: "var(--a-surface)",
          border: "1px solid var(--a-border)",
          borderRadius: "var(--a-r-lg)",
          padding: "20px 24px",
          maxWidth: 500,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--a-text)",
            marginBottom: 14,
          }}
        >
          Add New Category
        </p>

        <form onSubmit={handleAdd} noValidate>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              ref={nameInputRef}
              type="text"
              className="form-input"
              placeholder="e.g. Mobile Development"
              value={newName}
              maxLength={80}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={adding || !newName.trim()}
              style={{ flexShrink: 0 }}
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* List ------------------------------------------------------- */}
      {status === "loading" && <AdminSkeleton rows={4} />}

      {status === "error" && (
        <AdminError message={fetchError} onRetry={fetchCategories} />
      )}

      {status === "ready" && categories.length === 0 && (
        <AdminEmpty
          icon="🏷️"
          title="No categories yet"
          sub="Add your first category above, then assign it to projects."
        />
      )}

      {status === "ready" && categories.length > 0 && (
        <ul className="admin-list" aria-label="Category list">
          {categories.map((cat) => {
            const inUse = cat.projectCount > 0;
            const isDeleting = deletingId === cat._id;

            return (
              <li key={cat._id} className="admin-item">
                <div className="admin-item__body">
                  <span className="admin-item__name">{cat.name}</span>

                  <div className="admin-item__meta">
                    <code
                      style={{
                        fontSize: 11,
                        color: "var(--a-text-dim)",
                        background: "var(--a-surface-3)",
                        padding: "2px 7px",
                        borderRadius: 4,
                        fontFamily: "monospace",
                      }}
                    >
                      {cat.slug}
                    </code>

                    <span style={{ color: "var(--a-text-dim)" }}>·</span>

                    <span
                      className="admin-item__badge"
                      style={
                        !inUse
                          ? {
                              background: "transparent",
                              color: "var(--a-text-dim)",
                              borderColor: "var(--a-border)",
                            }
                          : undefined
                      }
                    >
                      {cat.projectCount}{" "}
                      {cat.projectCount === 1 ? "project" : "projects"}
                    </span>
                  </div>
                </div>

                <div className="admin-item__actions">
                  <button
                    className="btn btn--danger"
                    onClick={() =>
                      handleDelete(cat._id, cat.name, cat.projectCount)
                    }
                    disabled={inUse || isDeleting}
                    title={
                      inUse
                        ? `Cannot delete — ${cat.projectCount} project${cat.projectCount === 1 ? "" : "s"} use this category`
                        : "Delete category"
                    }
                    aria-label={`Delete category ${cat.name}`}
                  >
                    {isDeleting ? "…" : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Helper note ------------------------------------------------ */}
      {status === "ready" && categories.some((c) => c.projectCount > 0) && (
        <p
          style={{
            fontSize: 12,
            color: "var(--a-text-dim)",
            marginTop: -8,
          }}
        >
          Categories in use cannot be deleted. Reassign or remove their projects
          first.
        </p>
      )}
    </div>
  );
}
