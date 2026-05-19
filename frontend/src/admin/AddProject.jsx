import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AddProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    projectUrl: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      setError("Image is required");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("projectUrl", form.projectUrl);
    formData.append("image", form.image);

    try {
      await api.post("/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/projects");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PROJECT_CATEGORIES = [
    "Full Stack (MERN)",
    "Frontend (React)",
    "Backend / APIs",
    "AI / ML",
  ];

  return (
    <article className="admin">
      <header>
        <h2 className="h2 article-title">Add New Project</h2>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="text"
          name="title"
          className="form-input"
          placeholder="Project title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          className="form-input"
          placeholder="Project description"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>

        <select
          name="category"
          className="form-input"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          {PROJECT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="url"
          name="projectUrl"
          className="form-input"
          placeholder="Live project URL"
          value={form.projectUrl}
          onChange={handleChange}
        />

        <label className="form-input file-label">
          {form.image ? form.image.name : "Upload project image"}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
            required
          />
        </label>

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? "Adding..." : "Create Project"}
        </button>
      </form>
    </article>
  );
}
