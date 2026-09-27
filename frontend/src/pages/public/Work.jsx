import { useState } from "react";
import { NorthEast as NorthEastIcon, GitHub as GitHubIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";

import { usePublicProjectsQuery, usePublicProjectQuery } from "../../hooks/usePublicProjects";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { flattenTechNames } from "../../utils/projectHelpers";
import { excerptFromHtml } from "../../utils/html";
import { SkeletonGrid } from "../../components/public/Skeletons";
import { PublicError, PublicEmpty } from "../../components/public/StatusStates";
import ProjectDetailsModal from "../../components/public/ProjectDetailsModal";
import { trackPortfolioEvent } from "../../utils/portfolioAnalytics";
import { getThumbnailUrl } from "../../utils/cloudinaryTransform";

const PAGE_SIZE = 50;

function BrowserFrame({ image, label, url }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: "1px solid var(--border)", backgroundColor: "#1e1e1e" }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: "#2a2a2d", borderBottom: "1px solid var(--border)" }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#febc2e" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28c840" }} />
        <div className="flex-1 ml-3 px-3 py-1 rounded-md font-mono text-xs truncate" style={{ backgroundColor: "#1c1c1e", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          {url || label}
        </div>
      </div>
      <div style={{ aspectRatio: "16 / 10", backgroundColor: "#f5f5f5", position: "relative", overflow: "hidden" }}>
        {image ? (
          <img src={image} alt={label} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#f5f5f5" }}>
            <p className="font-sans text-lg font-semibold" style={{ color: "#333" }}>{label}</p>
            <p className="font-mono text-xs" style={{ color: "#999" }}>Preview image not available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Work() {
  const page = 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [closedPreviewId, setClosedPreviewId] = useState(null);
  const { isPreview, previewProjectId } = usePreviewMode();
  const { data: previewProject } = usePublicProjectQuery(previewProjectId, { preview: isPreview });
  const { data, isLoading, isFetching, isError, error, refetch } = usePublicProjectsQuery({ page, limit: PAGE_SIZE, preview: isPreview });
  const { data: seo } = usePublicSeo({ preview: isPreview });
  const projects = data?.projects ?? [];
  const project = projects[currentIndex];
  const canonical = seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/work` : "";

  const modalProject = selectedProject || (
    previewProjectId && closedPreviewId !== previewProjectId ? previewProject : null
  );

  useDocumentHead(buildPageSeo(seo, {
    pageTitle: seo?.defaultMetaTitle ? `Work — ${seo.defaultMetaTitle}` : "Work",
    pageCanonical: canonical,
  }));
  useStructuredData(canonical ? [{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects",
    url: canonical,
    description: seo?.defaultMetaDescription || "",
  }] : null);

  const viewProject = (item) => {
    if (!isPreview) trackPortfolioEvent("project_view", { projectId: item._id });
    setSelectedProject(item);
  };
  const changeProject = (direction) => {
    const next = (currentIndex + direction + projects.length) % projects.length;
    setCurrentIndex(next);
  };
  const closeProjectDetails = () => {
    setSelectedProject(null);
    if (previewProjectId) setClosedPreviewId(previewProjectId);
  };

  if (isError) {
    return <div className="page-enter"><section className="section-container py-16"><PublicError message={error?.message} onRetry={refetch} /></section></div>;
  }

  const technologies = project ? flattenTechNames(project.technologies) : [];
  const subtitle = project ? [project.category?.name, ...technologies].filter(Boolean).join(", ") : "";
  const liveUrl = project?.liveUrl || project?.projectUrl;

  return (
    <div className="page-enter">
      {isLoading ? (
        <section className="section-container py-16 min-h-[calc(100vh-80px)] flex items-center"><SkeletonGrid count={1} cardLines={5} /></section>
      ) : projects.length === 0 ? (
        <section className="section-container py-16 min-h-[calc(100vh-80px)] flex items-center justify-center"><PublicEmpty icon="🗂️" title="No projects found" message="Published projects will appear here." /></section>
      ) : (
        <section className="section-container py-16 min-h-[calc(100vh-80px)] flex items-center">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 w-full" style={{ opacity: isFetching ? 0.65 : 1, transition: "opacity 0.15s ease" }}>
            <div className="flex-1 max-w-md">
              <div className="font-mono font-bold mb-6" style={{ fontSize: "6rem", WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent", lineHeight: 1, letterSpacing: "-4px" }}>
                {String((page - 1) * PAGE_SIZE + currentIndex + 1).padStart(2, "0")}
              </div>
              <button type="button" onClick={() => viewProject(project)} className="block text-left border-0 bg-transparent p-0 cursor-pointer">
                <h1 className="font-mono text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: "var(--accent)", whiteSpace: "pre-line" }}>{project.title}</h1>
              </button>
              {subtitle && <p className="font-mono text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>{subtitle}</p>}
              {project.description && <p className="font-mono text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{excerptFromHtml(project.description, 500)}</p>}
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {technologies.map((technology, index) => (
                    <span key={technology} className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                      {technology}{index < technologies.length - 1 && <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>,</span>}
                    </span>
                  ))}
                </div>
              )}
              <hr className="section-divider mb-8" />
              <div className="flex items-center gap-4 mt-2">
                {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="arrow-btn arrow-btn-dark no-underline" aria-label="View live project"><NorthEastIcon sx={{ fontSize: 22 }} /></a>}
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="arrow-btn arrow-btn-dark no-underline" aria-label="View source on GitHub"><GitHubIcon sx={{ fontSize: 22 }} /></a>}
              </div>
            </div>

            <div className="flex-1 max-w-2xl w-full flex-shrink-0">
              <button type="button" onClick={() => viewProject(project)} className="block w-full border-0 bg-transparent p-0 cursor-pointer text-left">
                <BrowserFrame image={getThumbnailUrl(project.image?.url, 960)} label={project.title} url={liveUrl} />
              </button>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => changeProject(-1)} className="pagination-btn" aria-label="Previous project"><ChevronLeftIcon sx={{ fontSize: 24 }} /></button>
                <button type="button" onClick={() => changeProject(1)} className="pagination-btn" aria-label="Next project"><ChevronRightIcon sx={{ fontSize: 24 }} /></button>
              </div>
            </div>
          </div>
        </section>
      )}
      {modalProject && <ProjectDetailsModal project={modalProject} onClose={closeProjectDetails} />}
    </div>
  );
}
