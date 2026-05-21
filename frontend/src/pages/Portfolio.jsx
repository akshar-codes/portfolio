import { useState, useEffect } from "react";
import api from "../services/api";

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <article className="portfolio active">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        {loading && <p>Loading projects...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            <ul
              className="filter-list"
              role="list"
              aria-label="Filter projects by category"
            >
              {categories.map((category) => (
                <li key={category} className="filter-item">
                  <button
                    className={filter === category ? "active" : ""}
                    onClick={() => setFilter(category)}
                    aria-pressed={filter === category}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile dropdown — keep in sync with the active filter */}
            <div className="filter-select-box">
              <select
                className="filter-select form-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter projects by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <ul
              className="project-list"
              role="list"
              aria-live="polite"
              aria-label="Portfolio projects"
            >
              {filteredProjects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                filteredProjects.map((project) => (
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
          </>
        )}
      </section>
    </article>
  );
}
