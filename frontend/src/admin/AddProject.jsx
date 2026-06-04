import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";

/* ------------------------------------------------------------------ *
 * FilePickerField
 * ------------------------------------------------------------------ */
function FilePickerField({
  id,
  label,
  required,
  accept,
  file,
  onChange,
  hint,
}) {
  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
        {required && <span style={{ color: "var(--a-danger)" }}> *</span>}
      </label>
      <label className={`file-label${file ? " has-file" : ""}`} htmlFor={id}>
        <span className="file-label__icon">{file ? "🖼️" : "📁"}</span>
        <span className="file-label__text">
          {file ? file.name : "Click to upload (JPG, PNG, WEBP)"}
        </span>
        <input
          id={id}
          type="file"
          accept={accept ?? "image/*"}
          onChange={onChange}
          className="file-input"
        />
      </label>
      {hint && (
        <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GroupedTagInput
 * ------------------------------------------------------------------ */
export function GroupedTagInput({
  id,
  label,
  groups,
  onChange,
  maxGroups = 10,
}) {
  const [newGroupName, setNewGroupName] = useState("");
  const newGroupRef = useRef(null);

  /* Add a new empty group */
  const addGroup = () => {
    const name = newGroupName.trim();
    if (!name || groups.length >= maxGroups) return;
    onChange([...groups, { group: name, items: [] }]);
    setNewGroupName("");
    newGroupRef.current?.focus();
  };

  /* Rename an existing group */
  const renameGroup = (idx, newName) => {
    const updated = groups.map((g, i) =>
      i === idx ? { ...g, group: newName } : g,
    );
    onChange(updated);
  };

  /* Delete an entire group */
  const deleteGroup = (idx) => {
    onChange(groups.filter((_, i) => i !== idx));
  };

  /* Add an item to a group */
  const addItem = (groupIdx, item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (groups[groupIdx].items.includes(trimmed)) return;
    const updated = groups.map((g, i) =>
      i === groupIdx ? { ...g, items: [...g.items, trimmed] } : g,
    );
    onChange(updated);
  };

  /* Remove an item from a group */
  const removeItem = (groupIdx, itemIdx) => {
    const updated = groups.map((g, i) =>
      i === groupIdx
        ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) }
        : g,
    );
    onChange(updated);
  };

  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
      </label>

      {/* Existing groups */}
      {groups.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 12,
          }}
        >
          {groups.map((g, groupIdx) => (
            <GroupRow
              key={groupIdx}
              group={g}
              groupIdx={groupIdx}
              onRename={(name) => renameGroup(groupIdx, name)}
              onDelete={() => deleteGroup(groupIdx)}
              onAddItem={(item) => addItem(groupIdx, item)}
              onRemoveItem={(itemIdx) => removeItem(groupIdx, itemIdx)}
            />
          ))}
        </div>
      )}

      {/* Add new group row */}
      {groups.length < maxGroups && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={newGroupRef}
            id={id}
            type="text"
            className="form-input"
            placeholder='Add group (e.g. "Frontend", "Backend")'
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGroup();
              }
            }}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={addGroup}
            disabled={!newGroupName.trim()}
            style={{ flexShrink: 0 }}
          >
            + Add Group
          </button>
        </div>
      )}

      <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 6 }}>
        {groups.length}/{maxGroups} groups. Press Enter or click Add Group.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GroupRow — a single technology group with its items
 * ------------------------------------------------------------------ */
function GroupRow({
  group,
  groupIdx,
  onRename,
  onDelete,
  onAddItem,
  onRemoveItem,
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const handleAddItem = () => {
    const v = draft.trim();
    if (!v) return;
    onAddItem(v);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        border: "1px solid var(--a-border)",
        borderRadius: "var(--a-r-md)",
        padding: "12px 14px",
        background: "var(--a-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Group header: editable name + delete button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          className="form-input"
          value={group.group}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Group name"
          maxLength={80}
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--a-accent)",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--a-border)",
            borderRadius: 0,
            padding: "4px 0",
          }}
        />
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete group ${group.group}`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--a-danger)",
            fontSize: 16,
            padding: "0 4px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Chips */}
      {group.items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {group.items.map((item, itemIdx) => (
            <span
              key={itemIdx}
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
                onClick={() => onRemoveItem(itemIdx)}
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

      {/* Item input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder={`Add item to "${group.group}" (press Enter)`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem();
            }
          }}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleAddItem}
          disabled={!draft.trim()}
          style={{ flexShrink: 0 }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * TagInput — still used for features (flat array, unchanged)
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
                background: "hsla(45,100%,72%,0.10)",
                border: "1px solid hsla(45,100%,72%,0.20)",
                color: "var(--orange-yellow-crayola)",
                fontSize: 12,
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
          style={{ flex: 1 }}
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
      <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 4 }}>
        Press Enter or click Add. {items.length}/{maxItems} added.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GalleryPicker
 * ------------------------------------------------------------------ */
function GalleryPicker({ files, onChange }) {
  const handleAdd = (e) => {
    const newFiles = Array.from(e.target.files ?? []);
    const combined = [...files, ...newFiles].slice(0, 10);
    onChange(combined);
    e.target.value = "";
  };
  const remove = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="admin-form__field">
      <label className="admin-form__label">
        Gallery Screenshots
        <span
          style={{ color: "var(--light-gray)", fontWeight: 400, marginLeft: 6 }}
        >
          (optional, up to 10)
        </span>
      </label>
      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {files.map((f, idx) => {
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
                  border: "1px solid var(--jet)",
                }}
              >
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label="Remove image"
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
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      {files.length < 10 && (
        <label
          className="file-label"
          htmlFor="proj-gallery"
          style={{ maxWidth: 320 }}
        >
          <span className="file-label__icon">📷</span>
          <span className="file-label__text">
            Add screenshots ({files.length}/10)
          </span>
          <input
            id="proj-gallery"
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

/* ================================================================== *
 * Main AddProject component
 * ================================================================== */
export default function AddProject() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    liveUrl: "",
    githubUrl: "",
    challenge: "",
    solution: "",
  });
  const [technologies, setTechnologies] = useState([]); // [{ group, items }]
  const [features, setFeatures] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    api
      .get("/admin/categories")
      .then(({ data }) => setCategories(data ?? []))
      .catch((err) => setCategoriesError(err.message));
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!thumbnail) {
      toast.error("Please upload a project thumbnail.");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category.");
      return;
    }

    setLoading(true);

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
    fd.append("image", thumbnail);
    if (bannerImage) fd.append("bannerImage", bannerImage);
    galleryFiles.forEach((f) => fd.append("gallery", f));

    try {
      await api.post("/projects", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Project published successfully.");
      navigate("/admin/projects");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Add New Project</h2>
        <button
          className="btn btn--ghost"
          onClick={() => navigate("/admin/projects")}
          type="button"
        >
          ← Back
        </button>
      </div>

      <form
        className="admin-form"
        onSubmit={handleSubmit}
        noValidate
        style={{ maxWidth: 680 }}
      >
        {/* Title */}
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="proj-title">
            Project Title <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            id="proj-title"
            type="text"
            className="form-input"
            placeholder="e.g. E-commerce Dashboard"
            value={form.title}
            onChange={set("title")}
            required
          />
        </div>

        {/* Description */}
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="proj-desc">
            Description <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <textarea
            id="proj-desc"
            className="form-input"
            placeholder="Describe what this project does, what problem it solves…"
            value={form.description}
            onChange={set("description")}
            required
            maxLength={2000}
            style={{ minHeight: 110, resize: "vertical" }}
          />
          <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 4 }}>
            {form.description.length}/2000
          </p>
        </div>

        {/* Category + Live URL */}
        <div className="admin-form__row admin-form__row--2col">
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="proj-cat">
              Category <span style={{ color: "var(--a-danger)" }}>*</span>
            </label>
            {categoriesError ? (
              <p
                className="admin-form__error"
                style={{ margin: 0, padding: "10px 14px" }}
              >
                ⚠ {categoriesError}
              </p>
            ) : (
              <select
                id="proj-cat"
                className="form-input"
                value={form.category}
                onChange={set("category")}
                required
                disabled={categories.length === 0}
              >
                <option value="">
                  {categories.length === 0 ? "Loading…" : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="proj-live">
              Live URL
            </label>
            <input
              id="proj-live"
              type="url"
              className="form-input"
              placeholder="https://your-project.com"
              value={form.liveUrl}
              onChange={set("liveUrl")}
            />
          </div>
        </div>

        {/* GitHub URL */}
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="proj-github">
            GitHub URL
          </label>
          <input
            id="proj-github"
            type="url"
            className="form-input"
            placeholder="https://github.com/you/project"
            value={form.githubUrl}
            onChange={set("githubUrl")}
          />
        </div>

        {/* Technologies — grouped */}
        <GroupedTagInput
          id="proj-tech-group"
          label="Technologies Used"
          groups={technologies}
          onChange={setTechnologies}
        />

        {/* Features — flat */}
        <TagInput
          id="proj-features"
          label="Key Features"
          placeholder="e.g. Authentication, CRUD (press Enter)"
          items={features}
          onChange={setFeatures}
          maxItems={20}
        />

        {/* Thumbnail */}
        <FilePickerField
          id="proj-thumbnail"
          label="Project Thumbnail"
          required
          file={thumbnail}
          onChange={(e) => setThumbnail(e.target.files[0] ?? null)}
          hint="Required. Displayed on portfolio cards. Max 5 MB."
        />

        {/* Advanced toggle */}
        <div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setShowAdvanced((p) => !p)}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <span>Advanced Details (banner, gallery, challenge)</span>
            <span>{showAdvanced ? "▲" : "▼"}</span>
          </button>
        </div>

        {showAdvanced && (
          <>
            <FilePickerField
              id="proj-banner"
              label="Banner Image"
              file={bannerImage}
              onChange={(e) => setBannerImage(e.target.files[0] ?? null)}
              hint="Optional large banner shown at the top of the detail panel. Max 5 MB."
            />

            <GalleryPicker files={galleryFiles} onChange={setGalleryFiles} />

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="proj-challenge">
                Challenge
              </label>
              <textarea
                id="proj-challenge"
                className="form-input"
                placeholder="Describe a key technical challenge you faced…"
                value={form.challenge}
                onChange={set("challenge")}
                maxLength={1000}
                style={{ minHeight: 80, resize: "vertical" }}
              />
            </div>

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="proj-solution">
                Solution
              </label>
              <textarea
                id="proj-solution"
                className="form-input"
                placeholder="How did you solve it?"
                value={form.solution}
                onChange={set("solution")}
                maxLength={1000}
                style={{ minHeight: 80, resize: "vertical" }}
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}
        >
          <button
            type="submit"
            className="btn btn--primary"
            style={{ padding: "12px 28px", fontSize: 14 }}
            disabled={loading}
          >
            {loading ? "Publishing…" : "Publish Project"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/admin/projects")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
