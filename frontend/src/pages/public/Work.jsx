import { useState } from "react";
import { NorthEast as NorthEastIcon, GitHub as GitHubIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";

const PROJECTS = [
  {
    number: "01",
    title: "Kidney Disease\nDetection",
    subtitle: "Deep Learning, Cloud Deployment",
    description:
      "End-to-end kidney tumor detection using VGG-16, MLflow, DVC, and deployed on AWS.",
    tags: ["Keras", "MLflow", "DVC", "AWS"],
    liveUrl: "#",
    githubUrl: "https://github.com/gupta-akshar",
    previewImage: "/projects/kidney-detection.png",
    previewLabel: "Kidney Tumor Classification",
  },
  {
    number: "02",
    title: "Real Estate\nSearch Engine",
    subtitle: "Full Stack, Recommendation Engine",
    description:
      "Production-grade real estate portal with smart search, filter, and property recommendations — built during internship at 99Acres, Info Edge.",
    tags: ["React", "Node.js", "MongoDB", "Express"],
    liveUrl: "#",
    githubUrl: "https://github.com/gupta-akshar",
    previewImage: "/projects/real-estate.png",
    previewLabel: "Property Search Portal",
  },
  {
    number: "03",
    title: "DSA Visualizer",
    subtitle: "Educational Tool, Web App",
    description:
      "Interactive algorithm visualizer covering sorting, graph traversal, and tree operations — designed to accelerate DSA learning.",
    tags: ["React", "JavaScript", "Canvas API"],
    liveUrl: "#",
    githubUrl: "https://github.com/gupta-akshar",
    previewImage: "/projects/dsa-visualizer.png",
    previewLabel: "Algorithm Visualizer",
  },
];

/* Mini browser-window chrome that wraps each project screenshot */
function BrowserFrame({ image, label }) {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "#1e1e1e",
      }}
    >
      {/* Fake browser toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          backgroundColor: "#2a2a2d",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Window dots */}
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: "#ff5f57" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: "#febc2e" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: "#28c840" }}
        />

        {/* Fake address bar */}
        <div
          className="flex-1 ml-3 px-3 py-1 rounded-md font-mono text-xs truncate"
          style={{
            backgroundColor: "#1c1c1e",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          127.0.0.1:5000
        </div>
      </div>

      {/* Screenshot area */}
      <div
        style={{
          aspectRatio: "16 / 10",
          backgroundColor: "#f5f5f5",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
          onError={(e) => {
            // Fallback: hide img and show label
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        {/* Fallback when no screenshot image exists */}
        <div
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <p
            className="font-sans text-lg font-semibold"
            style={{ color: "#333" }}
          >
            {label}
          </p>
          <p className="font-mono text-xs" style={{ color: "#999" }}>
            Add screenshot to preview
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((i) => (i - 1 + PROJECTS.length) % PROJECTS.length);
  const next = () => setCurrent((i) => (i + 1) % PROJECTS.length);

  const project = PROJECTS[current];

  return (
    <div className="page-enter">
      <section className="section-container py-16 min-h-[calc(100vh-80px)] flex items-center">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 w-full">
          {/* Left: Project Info */}
          <div className="flex-1 max-w-md">
            {/* Outlined number */}
            <div
              className="font-mono font-bold mb-6"
              style={{
                fontSize: "6rem",
                WebkitTextStroke: "2px rgba(255,255,255,0.15)",
                color: "transparent",
                lineHeight: 1,
                letterSpacing: "-4px",
              }}
            >
              {project.number}
            </div>

            <h2
              className="font-mono text-4xl md:text-5xl font-bold leading-tight mb-4"
              style={{ color: "var(--accent)", whiteSpace: "pre-line" }}
            >
              {project.title}
            </h2>

            <p
              className="font-mono text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {project.subtitle}
            </p>

            <p
              className="font-mono text-base leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {project.tags.map((tag, i) => (
                <span
                  key={tag}
                  className="font-mono text-sm"
                  style={{ color: "var(--accent)" }}
                >
                  {tag}
                  {i < project.tags.length - 1 && (
                    <span
                      style={{ color: "var(--text-muted)", marginLeft: "6px" }}
                    >
                      ,
                    </span>
                  )}
                </span>
              ))}
            </div>

            <hr className="section-divider mb-8" />

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-btn arrow-btn-dark no-underline"
                aria-label="View live project"
              >
                <NorthEastIcon sx={{ fontSize: 22 }} />
              </a>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-btn arrow-btn-dark no-underline"
                aria-label="View source on GitHub"
              >
                <GitHubIcon sx={{ fontSize: 22 }} />
              </a>
            </div>
          </div>

          {/* Right: Project Preview */}
          <div className="flex-1 max-w-2xl w-full flex-shrink-0">
            <BrowserFrame
              image={project.previewImage}
              label={project.previewLabel}
            />

            {/* Pagination Controls */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={prev}
                className="pagination-btn"
                aria-label="Previous project"
              >
                <ChevronLeftIcon sx={{ fontSize: 24 }} />
              </button>

              <button
                onClick={next}
                className="pagination-btn"
                aria-label="Next project"
              >
                <ChevronRightIcon sx={{ fontSize: 24 }} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

