import { useState, useEffect } from "react";
import api from "../services/api";

const PAGE_SIZE = 9;

export default function Portfolio() {
  const [filter, setFilter] = useState("All");

  // Each entry: { _id, name, slug, projectCount }
  const [categories, setCategories] = useState([]);

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch non-empty categories once on mount
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data ?? []))
      .catch(() => {
        // Non-fatal — the filter bar simply won't show specific categories
      });
  }, []);

  // Fetch projects whenever filter or page changes
  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { page, limit: PAGE_SIZE };
        if (filter !== "All") params.category = filter; // send slug

        const { data } = await api.get("/projects", {
          params,
          signal: controller.signal,
        });

        setProjects(data.projects ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [filter, page]);

  const handleFilterChange = (slug) => {
    setFilter(slug);
    setPage(1); // always reset to page 1 on filter change
  };

  return (
    <article className="portfolio active">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        {/* ── Category filter — desktop list ───────────────────── */}
        <ul
          className="filter-list"
          role="list"
          aria-label="Filter projects by category"
        >
          <li className="filter-item">
            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => handleFilterChange("All")}
              aria-pressed={filter === "All"}
            >
              All
            </button>
          </li>

          {categories.map((cat) => (
            <li key={cat._id} className="filter-item">
              <button
                className={filter === cat.slug ? "active" : ""}
                onClick={() => handleFilterChange(cat.slug)}
                aria-pressed={filter === cat.slug}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>

        {/* ── Category filter — mobile dropdown ───────────────── */}
        <div className="filter-select-box">
          <select
            className="filter-select form-input"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Filter projects by category"
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── States ──────────────────────────────────────────── */}
        {loading && (
          <p style={{ color: "var(--light-gray)" }}>Loading projects…</p>
        )}

        {!loading && error && (
          <p style={{ color: "var(--bittersweet-shimmer)" }}>{error}</p>
        )}

        {/* ── Project grid ──────────────────────────────────── */}
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
                      aria-label={`${project.title} — ${project.category?.name ?? ""}. Opens in new tab`}
                    >
                      <figure className="project-img">
                        <img
                          src={project.image?.url || "/images/placeholder.png"}
                          alt={project.title}
                          loading="lazy"
                        />
                      </figure>
                      <h3 className="project-title">{project.title}</h3>
                      {/* category is now a populated object */}
                      <p className="project-category">
                        {project.category?.name ?? ""}
                      </p>
                    </a>
                  </li>
                ))
              )}
            </ul>

            {/* ── Pagination ──────────────────────────────────── */}
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
