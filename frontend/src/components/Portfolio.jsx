import { useState, useEffect } from "react";
import api from "../services/api";

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Extract unique categories from DB dynamically
  const categories = [
    "All",
    ...new Set(projects.map((project) => project.category)),
  ];

  // Case-insensitive filtering
  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.category === filter);

  return (
    <article className="portfolio active">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        {/* Loading State */}
        {loading && <p>Loading projects...</p>}

        {/* Error State */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Filter Buttons */}
            <ul className="filter-list">
              {categories.map((category) => (
                <li key={category} className="filter-item">
                  <button
                    className={filter === category ? "active" : ""}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>

            {/* Project List */}
            <ul className="project-list">
              {filteredProjects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                filteredProjects.map((project) => (
                  <li key={project._id} className="project-item active">
                    <a
                      href={project.projectUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
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
