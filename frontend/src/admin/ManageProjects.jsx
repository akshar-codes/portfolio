import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";
import { GroupedTagInput } from "./AddProject";

const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function moveItem(arr, index, direction) {
  const next = index + direction;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

function flattenTechNames(technologies) {
  if (!Array.isArray(technologies)) return [];
  if (technologies.length === 0) return [];

  // New grouped shape: [{ group, items }]
  if (
    typeof technologies[0] === "object" &&
    technologies[0] !== null &&
    "group" in technologies[0]
  ) {
    return technologies.flatMap((g) => g.items ?? []);
  }

  // Legacy flat shape: ["React", "Node.js"]
  return technologies.filter((t) => typeof t === "string");
}

/* ------------------------------------------------------------------ *
 * ReorderButtons
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ *
 * TagInput — flat array, used for features only
 * ------------------------------------------------------------------ */
function TagInput({ id, label, placeholder, items, onChange, maxItems = 30 }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v) || items.length >= maxItems) return;
    onChange([...items, v]);
    setDraft("");
    inputRef.current?.focus();
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && !draft && items.length > 0)
      remove(items.length - 1);
  };

  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
      </label>
      {items.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {items.map((item, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 100,
                fontSize: 12,
                background: "hsla(45,100%,72%,0.10)",
                border: "1px solid hsla(45,100%,72%,0.20)",
                color: "var(--orange-yellow-crayola)",
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label={`Remove ${item}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--a-danger)",
                  padding: "0 2px",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={items.length >= maxItems}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          type="button"
          className="btn btn--ghost"
          onClick={add}
          disabled={!draft.trim() || items.length >= maxItems}
          style={{ flexShrink: 0 }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GalleryManager
 * ------------------------------------------------------------------ */
function GalleryManager({
  existing = [],
  onDeleteExisting,
  newFiles,
  onNewFiles,
}) {
  const handleAdd = (e) => {
    const added = Array.from(e.target.files ?? []);
    const total = existing.length + newFiles.length + added.length;
    if (total > 10) {
      toast.warning("Gallery cannot exceed 10 images.");
      return;
    }
    onNewFiles([...newFiles, ...added]);
    e.target.value = "";
  };
  const removeNew = (idx) => onNewFiles(newFiles.filter((_, i) => i !== idx));

  return (
    <div className="admin-form__field">
      <label className="admin-form__label">Gallery Screenshots</label>
      {existing.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          {existing.map((img) => (
            <div
              key={img._id}
              style={{
                position: "relative",
                width: 80,
                height: 56,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--jet)",
              }}
            >
              <img
                src={img.url}
                alt="gallery"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => onDeleteExisting(img._id)}
                aria-label="Remove"
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--bittersweet-shimmer)",
                  border: "none",
                  color: "white",
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {newFiles.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          {newFiles.map((f, idx) => {
            const url = URL.createObjectURL(f);
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: 80,
                  height: 56,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px dashed var(--orange-yellow-crayola)",
                }}
              >
                <img
                  src={url}
                  alt="new"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => removeNew(idx)}
                  aria-label="Remove"
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--bittersweet-shimmer)",
                    border: "none",
                    color: "white",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      {existing.length + newFiles.length < 10 && (
        <label
          className="file-label"
          htmlFor="edit-gallery"
          style={{ maxWidth: 300 }}
        >
          <span className="file-label__icon">📷</span>
          <span className="file-label__text">
            Add screenshots ({existing.length + newFiles.length}/10)
          </span>
          <input
            id="edit-gallery"
            type="file"
            multiple
            accept="image/*"
            onChange={handleAdd}
            className="file-input"
          />
        </label>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * EditProjectModal
 * ------------------------------------------------------------------ */
function EditProjectModal({ project, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title ?? "",
    description: project.description ?? "",
    category: project.category?._id ?? "",
    liveUrl: project.liveUrl || project.projectUrl || "",
    githubUrl: project.githubUrl ?? "",
    challenge: project.challenge ?? "",
    solution: project.solution ?? "",
  });

  // Normalise incoming technologies to grouped shape
  const normaliseTech = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    if (typeof raw[0] === "object" && raw[0] !== null && "group" in raw[0])
      return raw;
    // Legacy flat array — wrap
    const items = raw.filter((t) => typeof t === "string" && t.trim());
    return items.length ? [{ group: "General", items }] : [];
  };

  const [technologies, setTechnologies] = useState(
    normaliseTech(project.technologies ?? []),
  );
  const [features, setFeatures] = useState([...(project.features ?? [])]);
  const [existingGallery, setExistingGallery] = useState(
    [...(project.gallery ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  );
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleDeleteGalleryItem = (id) => {
    setDeletedGalleryIds((prev) => [...prev, id]);
    setExistingGallery((prev) => prev.filter((g) => g._id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("liveUrl", form.liveUrl);
      fd.append("githubUrl", form.githubUrl);
      fd.append("challenge", form.challenge);
      fd.append("solution", form.solution);
      fd.append("technologies", JSON.stringify(technologies)); // [{group,items}]
      fd.append("features", JSON.stringify(features));
      if (newThumbnail) fd.append("image", newThumbnail);
      if (newBanner) fd.append("bannerImage", newBanner);
      newGalleryFiles.forEach((f) => fd.append("gallery", f));
      if (deletedGalleryIds.length > 0) {
        fd.append("deleteGalleryIds", JSON.stringify(deletedGalleryIds));
      }

      const { data } = await api.patch(`/projects/${project._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Project updated.");
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "hsla(0,0%,5%,0.85)",
          zIndex: 100,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 12px 24px",
          overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit project: ${project.title}`}
      >
        <div
          style={{
            background: "var(--eerie-black-2)",
            border: "1px solid var(--jet)",
            borderRadius: 20,
            padding: "28px 24px",
            width: "100%",
            maxWidth: 680,
            boxShadow: "var(--shadow-5)",
            position: "relative",
            animation: "fade 0.25s ease backwards",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "var(--onyx)",
              border: "none",
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--white-2)",
              fontSize: 20,
              cursor: "pointer",
              opacity: 0.75,
            }}
          >
            ×
          </button>

          <h2 className="admin-page__title" style={{ marginBottom: 20 }}>
            Edit Project
          </h2>

          <form
            className="admin-form"
            onSubmit={handleSave}
            noValidate
            style={{ maxWidth: "100%" }}
          >
            {/* Title */}
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="ep-title">
                Title <span style={{ color: "var(--a-danger)" }}>*</span>
              </label>
              <input
                id="ep-title"
                className="form-input"
                value={form.title}
                onChange={set("title")}
                required
              />
            </div>

            {/* Description */}
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="ep-desc">
                Description <span style={{ color: "var(--a-danger)" }}>*</span>
              </label>
              <textarea
                id="ep-desc"
                className="form-input"
                value={form.description}
                onChange={set("description")}
                required
                maxLength={2000}
                style={{ minHeight: 100, resize: "vertical" }}
              />
            </div>

            {/* Category + Live URL */}
            <div className="admin-form__row admin-form__row--2col">
              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="ep-cat">
                  Category
                </label>
                <select
                  id="ep-cat"
                  className="form-input"
                  value={form.category}
                  onChange={set("category")}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="ep-live">
                  Live URL
                </label>
                <input
                  id="ep-live"
                  type="url"
                  className="form-input"
                  value={form.liveUrl}
                  onChange={set("liveUrl")}
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="ep-github">
                GitHub URL
              </label>
              <input
                id="ep-github"
                type="url"
                className="form-input"
                value={form.githubUrl}
                onChange={set("githubUrl")}
              />
            </div>

            {/* Technologies — grouped */}
            <GroupedTagInput
              id="ep-tech-group"
              label="Technologies Used"
              groups={technologies}
              onChange={setTechnologies}
            />

            {/* Features — flat */}
            <TagInput
              id="ep-feat"
              label="Key Features"
              placeholder="Add feature…"
              items={features}
              onChange={setFeatures}
              maxItems={20}
            />

            {/* Replace thumbnail */}
            <div className="admin-form__field">
              <label className="admin-form__label">
                Replace Thumbnail
                <span
                  style={{
                    color: "var(--light-gray)",
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  (optional)
                </span>
              </label>
              <label
                className={`file-label${newThumbnail ? " has-file" : ""}`}
                htmlFor="ep-thumb"
              >
                <span className="file-label__icon">
                  {newThumbnail ? "🖼️" : "📁"}
                </span>
                <span className="file-label__text">
                  {newThumbnail
                    ? newThumbnail.name
                    : "Click to replace thumbnail"}
                </span>
                <input
                  id="ep-thumb"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewThumbnail(e.target.files[0] ?? null)}
                  className="file-input"
                />
              </label>
            </div>

            {/* Replace banner */}
            <div className="admin-form__field">
              <label className="admin-form__label">
                Replace Banner Image
                <span
                  style={{
                    color: "var(--light-gray)",
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  (optional)
                </span>
              </label>
              <label
                className={`file-label${newBanner ? " has-file" : ""}`}
                htmlFor="ep-banner"
              >
                <span className="file-label__icon">
                  {newBanner ? "🖼️" : "📁"}
                </span>
                <span className="file-label__text">
                  {newBanner ? newBanner.name : "Click to replace banner"}
                </span>
                <input
                  id="ep-banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBanner(e.target.files[0] ?? null)}
                  className="file-input"
                />
              </label>
            </div>

            {/* Gallery */}
            <GalleryManager
              existing={existingGallery}
              onDeleteExisting={handleDeleteGalleryItem}
              newFiles={newGalleryFiles}
              onNewFiles={setNewGalleryFiles}
            />

            {/* Challenge */}
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="ep-challenge">
                Challenge
              </label>
              <textarea
                id="ep-challenge"
                className="form-input"
                value={form.challenge}
                onChange={set("challenge")}
                maxLength={1000}
                style={{ minHeight: 70, resize: "vertical" }}
              />
            </div>

            {/* Solution */}
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="ep-solution">
                Solution
              </label>
              <textarea
                id="ep-solution"
                className="form-input"
                value={form.solution}
                onChange={set("solution")}
                maxLength={1000}
                style={{ minHeight: 70, resize: "vertical" }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 4,
              }}
            >
              <button
                type="submit"
                className="btn btn--primary"
                style={{ padding: "12px 28px", fontSize: 14 }}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ================================================================== *
 * Main ManageProjects component
 * ================================================================== */
export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [localProjects, setLocalProjects] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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

  useEffect(() => {
    api
      .get("/admin/categories")
      .then(({ data }) => setCategories(data ?? []))
      .catch(() => {});
  }, []);

  const handleOpenEdit = async (projectId) => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setEditingProject(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditSaved = () => {
    fetchProjects(page);
  };

  const deleteProject = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis will permanently remove the project and all its images.`,
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

  const orderDirty =
    !savingOrder &&
    localProjects !== null &&
    localProjects.some((p, i) => projects[i]?._id !== p._id);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const displayProjects = localProjects ?? projects;

  return (
    <>
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

        {status === "ready" && displayProjects.length > 1 && (
          <p
            style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -8 }}
          >
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
              {displayProjects.map((project, index) => {
                const techNames = flattenTechNames(project.technologies);
                return (
                  <li
                    key={project._id}
                    className="admin-item"
                    style={{ alignItems: "flex-start", padding: "14px 18px" }}
                  >
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
                        {techNames.length > 0 && (
                          <span
                            style={{ fontSize: 11, color: "var(--a-text-m)" }}
                          >
                            {techNames.slice(0, 3).join(", ")}
                            {techNames.length > 3 &&
                              ` +${techNames.length - 3}`}
                          </span>
                        )}
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
                        className="btn btn--ghost"
                        onClick={() => handleOpenEdit(project._id)}
                        disabled={savingOrder}
                        aria-label={`Edit project ${project.title}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() =>
                          deleteProject(project._id, project.title)
                        }
                        disabled={savingOrder}
                        aria-label={`Delete project ${project.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
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

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          categories={categories}
          onClose={() => setEditingProject(null)}
          onSaved={handleEditSaved}
        />
      )}
    </>
  );
}
