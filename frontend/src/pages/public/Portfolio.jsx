import { useState, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { PORTFOLIO_PAGE_SIZE } from "../../constants/pagination";
import Pagination from "../../components/common/Pagination";

const ProjectDetails = lazy(() => import("../../utils/ProjectDetails"));

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Detail modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch non-empty categories once on mount
  useEffect(() => {
    api
      .get(API_ENDPOINTS.categories)
      .then(({ data }) => setCategories(data ?? []))
      .catch(() => {});
  }, []);

  // Fetch projects whenever filter or page changes
  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = { page, limit: PORTFOLIO_PAGE_SIZE };
        if (filter !== "All") params.category = filter;

        const { data } = await api.get(API_ENDPOINTS.projects, {
          params,
          signal: controller.signal,
        });

        setProjects(data.projects ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          toast.error(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [filter, page]);

  const handleFilterChange = (slug) => {
    setFilter(slug);
    setPage(1);
  };

  // Open detail panel — fetch full project data
  const handleProjectClick = async (e, projectId) => {
    e.preventDefault();
    if (detailLoading) return;
    setDetailLoading(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.projectById(projectId));
      setSelectedProject(data);
    } catch (err) {
      toast.error(err.message || "Failed to load project details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetails = () => setSelectedProject(null);

  return (
    <>
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

          {/* ── Loading state ──────────────────────────────────────── */}
          {loading && (
            <p style={{ color: "var(--light-gray)" }}>Loading projects…</p>
          )}

          {/* ── Project grid ──────────────────────────────────────── */}
          {!loading && (
            <>
              <ul
                className="project-list"
                role="list"
                aria-live="polite"
                aria-label="Portfolio projects"
              >
                {projects.length === 0 ? (
                  <p style={{ color: "var(--light-gray)" }}>
                    No projects found.
                  </p>
                ) : (
                  projects.map((project) => (
                    <li key={project._id} className="project-item active">
                      <a
                        href={project.liveUrl || project.projectUrl || "#"}
                        onClick={(e) => handleProjectClick(e, project._id)}
                        aria-label={`${project.title} — ${project.category?.name ?? ""}. Click to view details`}
                        style={{ cursor: detailLoading ? "wait" : "pointer" }}
                      >
                        <figure className="project-img">
                          <div className="project-item-icon-box">
                            <ion-icon name="eye-outline" />
                          </div>
                          <img
                            src={
                              project.image?.url || "/images/placeholder.png"
                            }
                            alt={project.title}
                            loading="lazy"
                          />
                        </figure>
                        <h3 className="project-title">{project.title}</h3>
                        <p className="project-category">
                          {project.category?.name ?? ""}
                        </p>
                      </a>
                    </li>
                  ))
                )}
              </ul>

              {/* ── Pagination ──────────────────────────────────── */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </article>

      {/* ── Project Details Modal ─────────────────────────────────── */}
      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectDetails
            project={selectedProject}
            onClose={handleCloseDetails}
          />
        </Suspense>
      )}
    </>
  );
}
