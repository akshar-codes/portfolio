import { useState, useEffect } from "react";
import api from "../services/api";

const PAGE_SIZE = 9;

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/projects/categories")
      .then(({ data }) => setCategories(["All", ...(data ?? [])]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit: PAGE_SIZE };
        if (filter !== "All") params.category = filter;

        const { data } = await api.get("/projects", { params });
        setProjects(data.projects ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [filter, page]);

  const handleFilterChange = (category) => {
    setFilter(category);
    setPage(1); // reset to first page on filter change
  };

  return (
    <article className="portfolio active">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        {/* Category filter — desktop list */}
        <ul
          className="filter-list"
          role="list"
          aria-label="Filter projects by category"
        >
          {categories.map((category) => (
            <li key={category} className="filter-item">
              <button
                className={filter === category ? "active" : ""}
                onClick={() => handleFilterChange(category)}
                aria-pressed={filter === category}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>

        {/* Category filter — mobile dropdown */}
        <div className="filter-select-box">
          <select
            className="filter-select form-input"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Filter projects by category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ color: "var(--light-gray)" }}>Loading projects…</p>
        )}
        {error && (
          <p style={{ color: "var(--bittersweet-shimmer)" }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <ul
              className="project-list"
              role="list"
              aria-live="polite"
              aria-label="Portfolio projects"
            >
              {projects.length === 0 ? (
                <p style={{ color: "var(--light-gray)" }}>No projects found.</p>
              ) : (
                projects.map((project) => (
                  <li key={project._id} className="project-item active">
                    <a
                      href={project.projectUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} — ${project.category}. Opens in new tab`}
                    >
                      <figure className="project-img">
                        <img
                          src={project.image?.url || "/images/placeholder.png"}
                          alt={project.title}
                          loading="lazy"
                        />
                      </figure>
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-category">{project.category}</p>
                    </a>
                  </li>
                ))
              )}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="pagination"
                role="navigation"
                aria-label="Project pages"
              >
                <button
                  className="btn btn--ghost"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    color: "var(--light-gray)",
                    fontSize: "13px",
                    padding: "0 12px",
                  }}
                >
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn--ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </article>
  );
}
