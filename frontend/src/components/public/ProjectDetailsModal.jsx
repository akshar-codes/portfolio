import { useCallback, useEffect, useRef, useState } from "react";
import { IoCloseOutline, IoLogoGithub, IoOpenOutline } from "react-icons/io5";
import { flattenTechNames } from "../../utils/projectHelpers";
import { getPreviewUrl, getThumbnailUrl } from "../../utils/cloudinaryTransform";

function preventDefault(e) {
  e.preventDefault();
}

/* ------------------------------------------------------------------ *
 * GalleryViewer — banner/thumbnail + gallery strip
 * ------------------------------------------------------------------ */
function GalleryViewer({ thumbnail, banner, gallery = [] }) {
  const images = [];
  if (banner?.url) images.push({ url: banner.url, label: "Banner" });
  if (thumbnail?.url) images.push({ url: thumbnail.url, label: "Thumbnail" });
  gallery
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((g, i) => {
      if (g?.url) images.push({ url: g.url, label: `Screenshot ${i + 1}` });
    });

  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)", lineHeight: 0 }}
      >
        <img
          src={getPreviewUrl(images[active].url, 1200)}
          alt={images[active].label}
          loading="lazy"
          className="w-full block"
          style={{ maxHeight: 360, objectFit: "cover" }}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={img.label}
              className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer p-0 transition-all duration-200"
              style={{
                width: 76,
                height: 52,
                border: idx === active ? "2px solid var(--accent)" : "2px solid transparent",
                backgroundColor: "var(--bg-secondary)",
                lineHeight: 0,
              }}
            >
              <img
                src={getThumbnailUrl(img.url, 180)}
                alt={img.label}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TechBadge({ label }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full font-mono text-xs whitespace-nowrap"
      style={{
        backgroundColor: "rgba(0,255,136,0.1)",
        border: "1px solid rgba(0,255,136,0.25)",
        color: "var(--accent)",
      }}
    >
      {label}
    </span>
  );
}

function SectionHeading({ children }) {
  return (
    <h3
      className="font-mono text-sm font-bold mb-3 relative pb-2"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
      <span
        className="absolute bottom-0 left-0 block rounded-full"
        style={{ width: 26, height: 3, backgroundColor: "var(--accent)" }}
      />
    </h3>
  );
}

function TechnologiesSection({ technologies }) {
  if (!Array.isArray(technologies) || technologies.length === 0) return null;
  const isGrouped =
    typeof technologies[0] === "object" && technologies[0] !== null && "group" in technologies[0];

  return (
    <section className="mb-6">
      <SectionHeading>Technologies Used</SectionHeading>
      {isGrouped ? (
        <div className="flex flex-col gap-4">
          {technologies.map((group, gIdx) => (
            <div key={gIdx}>
              <p
                className="font-mono text-xs font-semibold mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {group.group}
              </p>
              <div className="flex flex-wrap gap-2">
                {(group.items ?? []).map((item, iIdx) => (
                  <TechBadge key={iIdx} label={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {flattenTechNames(technologies).map((tech, idx) => (
            <TechBadge key={idx} label={tech} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Main modal
 * ------------------------------------------------------------------ */
export default function ProjectDetailsModal({ project, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const openerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 240);
  }, [onClose]);

  useEffect(() => {
    openerRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, [handleClose]);

  if (!project) return null;

  const {
    title,
    category,
    description,
    technologies = [],
    features = [],
    challenge,
    solution,
    githubUrl,
    liveUrl,
    projectUrl,
    image,
    bannerImage,
    gallery = [],
    featured,
  } = project;

  const resolvedLiveUrl = liveUrl || projectUrl || "";
  const hasChallengeSection = challenge?.trim() || solution?.trim();

  return (
    <>
      <div
        ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && handleClose()}
        onTouchMove={preventDefault}
        className="fixed inset-0 z-40"
        style={{
          background: "hsla(0,0%,5%,0.85)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.24s ease",
        }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Project details: ${title}`}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
        style={{ padding: "56px 12px 24px", pointerEvents: "none" }}
      >
        <article
          className="w-full rounded-2xl relative"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            padding: "26px 22px",
            maxWidth: 720,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.24s cubic-bezier(0.16,1,0.3,1), opacity 0.24s ease",
            pointerEvents: "all",
          }}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close project details"
            className="absolute top-4 right-4 flex items-center justify-center rounded-lg cursor-pointer border-0 z-10"
            style={{
              width: 34,
              height: 34,
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: 20,
            }}
          >
            <IoCloseOutline />
          </button>

          <GalleryViewer
            thumbnail={image}
            banner={bannerImage?.url ? bannerImage : null}
            gallery={gallery}
          />

          <div className="mt-5 mb-5">
            <div className="flex items-center gap-2 flex-wrap mb-2 pr-8">
              <h2 className="font-mono text-xl font-bold" style={{ color: "var(--accent)" }}>
                {title}
              </h2>
              {featured && (
                <span
                  className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
                >
                  Featured
                </span>
              )}
            </div>
            {category?.name && (
              <span
                className="inline-block font-mono text-xs px-3 py-1 rounded-lg"
                style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}
              >
                {category.name}
              </span>
            )}
          </div>

          <hr className="section-divider mb-5" />

          {description && (
            <section className="mb-6">
              <SectionHeading>About This Project</SectionHeading>
              <p
                className="font-mono text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </section>
          )}

          <TechnologiesSection technologies={technologies} />

          {features.length > 0 && (
            <section className="mb-6">
              <SectionHeading>Key Features</SectionHeading>
              <ul
                className="grid gap-x-4 gap-y-2 list-none p-0 m-0"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 font-mono text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasChallengeSection && (
            <section className="mb-6">
              <SectionHeading>Challenges &amp; Solutions</SectionHeading>
              <div
                className="grid gap-3.5"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {challenge?.trim() && (
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <p
                      className="font-mono text-xs font-bold mb-2 uppercase tracking-wide"
                      style={{ color: "var(--accent)" }}
                    >
                      Challenge
                    </p>
                    <p
                      className="font-mono text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                      dangerouslySetInnerHTML={{ __html: challenge }}
                    />
                  </div>
                )}
                {solution?.trim() && (
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <p
                      className="font-mono text-xs font-bold mb-2 uppercase tracking-wide"
                      style={{ color: "var(--accent)" }}
                    >
                      Solution
                    </p>
                    <p
                      className="font-mono text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                      dangerouslySetInnerHTML={{ __html: solution }}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {(resolvedLiveUrl || githubUrl) && (
            <>
              <hr className="section-divider mb-4" />
              <div className="flex gap-3 flex-wrap">
                {resolvedLiveUrl && (
                  <a
                    href={resolvedLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-semibold no-underline flex-1"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "#1c1c1e",
                      minWidth: 140,
                      maxWidth: 260,
                      textDecoration: "none",
                    }}
                  >
                    <IoOpenOutline style={{ fontSize: 16 }} />
                    View Live Project
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-semibold no-underline flex-1"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                      minWidth: 140,
                      maxWidth: 260,
                      textDecoration: "none",
                    }}
                  >
                    <IoLogoGithub style={{ fontSize: 17 }} />
                    View Source Code
                  </a>
                )}
              </div>
            </>
          )}
        </article>
      </div>
    </>
  );
}
