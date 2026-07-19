import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { ROUTES } from "../../constants/routes";
import { GroupedTagInput } from "../../components/common/GroupedTagInput";
import TagInput from "../../components/common/TagInput";
import FilePickerField from "../../components/common/FilePickerField";

/* ------------------------------------------------------------------ *
 * GalleryPicker — new-project gallery upload (multi-file, local only)
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
      .get(API_ENDPOINTS.adminCategories)
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
      await api.post(API_ENDPOINTS.projects, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Project published successfully.");
      navigate(ROUTES.adminProjects);
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
          onClick={() => navigate(ROUTES.adminProjects)}
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
            onClick={() => navigate(ROUTES.adminProjects)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
