import { useState, useEffect } from "react";
import { GitHub as GitHubIcon, Search as SearchIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";

import { usePublicProjectsQuery } from "../../hooks/usePublicProjects";
import { usePublicCategoriesQuery } from "../../hooks/usePublicCategories";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { flattenTechNames } from "../../utils/projectHelpers";
import { excerptFromHtml } from "../../utils/html";
import { SkeletonGrid } from "../../components/public/Skeletons";
import { PublicError, PublicEmpty } from "../../components/public/StatusStates";
import ProjectDetailsModal from "../../components/public/ProjectDetailsModal";

const PAGE_SIZE = 6;

const inputStyles = {
  padding: "12px 16px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.85rem",
  outline: "none",
};

/* ------------------------------------------------------------------ *
 * BrowserFrame — preserved from the original single-project layout,
 * reused per-card in the new grid.
 * ------------------------------------------------------------------ */
function BrowserFrame({ image, label }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: "1px solid var(--border)", backgroundColor: "#1e1e1e" }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "#2a2a2d", borderBottom: "1px solid var(--border)" }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#febc2e" }} />
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#28c840" }} />
      </div>
      <div style={{ aspectRatio: "16 / 10", backgroundColor: "#f5f5f5", position: "relative", overflow: "hidden" }}>
        {image ? (
          <img
            src={image}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <p className="font-sans text-sm font-semibold" style={{ color: "#333" }}>
              {label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onViewDetails }) {
  const techNames = flattenTechNames(project.technologies);
  const liveUrl = project.liveUrl || project.projectUrl;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onViewDetails(project)}
        className="cursor-pointer border-0 p-0 bg-transparent text-left w-full"
      >
        <BrowserFrame image={project.image?.url} label={project.title} />
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {project.title}
          </h3>
          {project.category?.name && (
            <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>
              {project.category.name}
            </span>
          )}
        </div>
        {project.featured && project.status === "published" && (
          <span
            className="font-mono text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
          >
            FEATURED
          </span>
        )}
        {project.status && project.status !== "published" && (
          <span
            className="font-mono text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: "var(--warning-main, #ed6c02)", color: "#fff" }}
          >
            {project.status.toUpperCase()}
          </span>
        )}
      </div>

      {project.description && (
        <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {excerptFromHtml(project.description, 110)}
        </p>
      )}

      {techNames.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {techNames.slice(0, 4).map((tech, i) => (
            <span key={tech} className="font-mono text-xs" style={{ color: "var(--accent)" }}>
              {tech}
              {i < Math.min(techNames.length, 4) - 1 && <span style={{ color: "var(--text-muted)" }}>,</span>}
            </span>
          ))}
          {techNames.length > 4 && (
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              +{techNames.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-1">
        <button
          type="button"
          onClick={() => onViewDetails(project)}
          className="font-mono text-xs font-semibold px-4 py-2 rounded-full border-0 cursor-pointer"
          style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
        >
          View Details
        </button>
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View live project"
            className="arrow-btn arrow-btn-dark no-underline"
            style={{ width: 40, height: 40 }}
          >
            <OpenInNewIcon sx={{ fontSize: 18 }} />
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="arrow-btn arrow-btn-dark no-underline"
            style={{ width: 40, height: 40 }}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Work() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);

  const { isPreview, previewProjectId } = usePreviewMode();

  const { data: categories } = usePublicCategoriesQuery({ preview: isPreview });

  const { data, isLoading, isFetching, isError, error, refetch } = usePublicProjectsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: category || undefined,
    preview: isPreview,
  });

  useEffect(() => {
    if (previewProjectId) {
      // In a real scenario, this might need an extra query if the project is not on the first page,
      // but passing it as an ID to the modal will let the modal's own query fetch it if we just fake the object.
      setSelectedProject({ _id: previewProjectId });
    }
  }, [previewProjectId]);

  const { data: seo } = usePublicSeo({ preview: isPreview });

  const canonical = seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/work` : "";

  useDocumentHead(
    buildPageSeo(seo, {
      pageTitle: seo?.defaultMetaTitle ? `Work — ${seo.defaultMetaTitle}` : "Work",
      pageCanonical: canonical,
    }),
  );

  // ── Structured Data ────────────────────────────────────────────────
  const breadcrumbSchema = canonical
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: seo?.canonicalBaseUrl || "",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Work",
            item: canonical,
          },
        ],
      }
    : null;

  const collectionSchema = canonical
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Projects",
        url: canonical,
        description: seo?.defaultMetaDescription || "",
      }
    : null;

  useStructuredData([breadcrumbSchema, collectionSchema].filter(Boolean));

  const projects = data?.projects ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="page-enter">
        <section className="section-container py-16">
          <PublicError message={error?.message} onRetry={refetch} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <section className="section-container py-16">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <SearchIcon
              sx={{ fontSize: 18 }}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
              style={{ ...inputStyles, width: "100%", paddingLeft: 40 }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => handleFilterChange(setCategory)(e.target.value)}
            style={{ ...inputStyles, minWidth: 200 }}
          >
            <option value="">All categories</option>
            {(categories ?? []).map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.projectCount})
              </option>
            ))}
          </select>
        </div>

        {isLoading && <SkeletonGrid count={6} cardLines={3} className="sm:grid-cols-2 lg:grid-cols-3" />}

        {!isLoading && projects.length === 0 && (
          <PublicEmpty
            icon="🗂️"
            title="No projects found"
            message={search || category ? "Try a different search term or category." : "Projects will appear here once published."}
          />
        )}

        {!isLoading && projects.length > 0 && (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
              style={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 0.15s ease" }}
            >
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} onViewDetails={setSelectedProject} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-14">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  style={{ opacity: page === 1 ? 0.4 : 1 }}
                >
                  ←
                </button>
                <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  style={{ opacity: page === totalPages ? 0.4 : 1 }}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
