import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddProject() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    projectUrl: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/projects/categories")
      .then(({ data }) => setCategories(data ?? []))
      .catch(() =>
        setCategoriesError("Could not load categories. Please refresh."),
      );
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setError("Please upload a project image.");
      return;
    }

    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("projectUrl", form.projectUrl);
    fd.append("image", form.image);

    try {
      await api.post("/projects", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
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

      {/* Form */}
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="proj-title">
            Project Title <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            id="proj-title"
            type="text"
            name="title"
            className="form-input"
            placeholder="e.g. E-commerce Dashboard"
            value={form.title}
            onChange={handleChange}
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
            name="description"
            className="form-input"
            placeholder="Brief description of what this project does…"
            value={form.description}
            onChange={handleChange}
            required
            style={{ minHeight: 100, resize: "vertical" }}
          />
        </div>

        {/* Category + URL row */}
        <div className="admin-form__row admin-form__row--2col">
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="proj-cat">
              Category <span style={{ color: "var(--a-danger)" }}>*</span>
            </label>
            {categoriesError ? (
              <p className="admin-form__error">{categoriesError}</p>
            ) : (
              <select
                id="proj-cat"
                name="category"
                className="form-input"
                value={form.category}
                onChange={handleChange}
                required
                disabled={categories.length === 0}
              >
                <option value="">
                  {categories.length === 0 ? "Loading…" : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="proj-url">
              Live URL
            </label>
            <input
              id="proj-url"
              type="url"
              name="projectUrl"
              className="form-input"
              placeholder="https://your-project.com"
              value={form.projectUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="admin-form__field">
          <label className="admin-form__label">
            Project Image <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <label
            className={`file-label${form.image ? " has-file" : ""}`}
            htmlFor="proj-image"
          >
            <span className="file-label__icon">{form.image ? "🖼️" : "📁"}</span>
            <span className="file-label__text">
              {form.image
                ? form.image.name
                : "Click to upload image (JPG, PNG, WEBP)"}
            </span>
            <input
              id="proj-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
              required
            />
          </label>
          <p style={{ fontSize: 11, color: "var(--a-text-dim)", marginTop: 6 }}>
            Max 5 MB. Accepted formats: JPG, PNG, WEBP, GIF
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-form__error" role="alert">
            <span>⚠</span> {error}
          </div>
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
