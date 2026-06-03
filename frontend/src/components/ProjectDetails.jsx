import { useEffect, useRef, useState, useCallback } from "react";
import { IoCloseOutline, IoLogoGithub, IoOpenOutline } from "react-icons/io5";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function preventDefault(e) {
  e.preventDefault();
}

/* ------------------------------------------------------------------ *
 * GalleryViewer — lightbox-style thumbnail strip
 * ------------------------------------------------------------------ */
function GalleryViewer({ thumbnail, banner, gallery = [] }) {
  // Build the full image list: banner (if exists) → thumbnail → gallery
  const images = [];

  if (banner?.url) images.push({ url: banner.url, label: "Banner" });
  if (thumbnail?.url) images.push({ url: thumbnail.url, label: "Thumbnail" });
  gallery.forEach((g, i) => {
    if (g?.url) images.push({ url: g.url, label: `Screenshot ${i + 1}` });
  });

  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Main image */}
      <div
        style={{
          width: "100%",
          borderRadius: "var(--a-r-lg, 16px)",
          overflow: "hidden",
          background: "var(--onyx)",
          position: "relative",
          lineHeight: 0,
        }}
      >
        <img
          src={images[active].url}
          alt={images[active].label}
          loading="lazy"
          style={{
            width: "100%",
            maxHeight: 340,
            objectFit: "cover",
            display: "block",
            transition: "opacity 0.25s ease",
          }}
        />
      </div>

      {/* Thumbnail strip — only when there are multiple images */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            scrollbarWidth: "none",
          }}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              aria-label={img.label}
              style={{
                flexShrink: 0,
                width: 72,
                height: 50,
                borderRadius: 8,
                overflow: "hidden",
                border:
                  idx === active
                    ? "2px solid var(--orange-yellow-crayola)"
                    : "2px solid transparent",
                background: "var(--onyx)",
                padding: 0,
                cursor: "pointer",
                transition: "border-color 0.2s",
                lineHeight: 0,
              }}
            >
              <img
                src={img.url}
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

/* ------------------------------------------------------------------ *
 * TechBadge
 * ------------------------------------------------------------------ */
function TechBadge({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 500,
        background: "hsla(45,100%,72%,0.10)",
        border: "1px solid hsla(45,100%,72%,0.22)",
        color: "var(--orange-yellow-crayola)",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * SectionHeading — matches article-title style from index.css
 * ------------------------------------------------------------------ */
function SectionHeading({ children }) {
  return (
    <h3
      style={{
        fontSize: "var(--fs-4, 16px)",
        fontWeight: 600,
        color: "var(--white-2)",
        position: "relative",
        paddingBottom: 8,
        marginBottom: 14,
        textTransform: "capitalize",
      }}
    >
      {children}
      <span
        style={{
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 28,
          height: 3,
          background: "var(--text-gradient-yellow)",
          borderRadius: 3,
          display: "block",
        }}
      />
    </h3>
  );
}

/* ------------------------------------------------------------------ *
 * Main ProjectDetails modal
 * ------------------------------------------------------------------ */
export default function ProjectDetails({ project, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Focus trap + close on Escape
  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();

      // Trap focus inside panel
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

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
  } = project;

  const resolvedLiveUrl = liveUrl || projectUrl || "";
  const hasChallengeSection = challenge?.trim() || solution?.trim();

  return (
    <>
      {/* ── Overlay ───────────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        onTouchMove={preventDefault}
        style={{
          position: "fixed",
          inset: 0,
          background: "hsla(0,0%,5%,0.85)",
          zIndex: 20,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.28s ease",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "60px 12px 24px",
          overflowY: "auto",
        }}
        aria-hidden="true"
      />

      {/* ── Panel ─────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Project details: ${title}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 21,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "60px 12px 24px",
          overflowY: "auto",
          pointerEvents: "none",
        }}
      >
        <article
          style={{
            background: "var(--eerie-black-2)",
            border: "1px solid var(--jet)",
            borderRadius: 20,
            padding: "28px 24px",
            width: "100%",
            maxWidth: 720,
            position: "relative",
            boxShadow: "var(--shadow-5)",
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.97)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease",
            pointerEvents: "all",
            animation: "fade 0.28s ease backwards",
          }}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close project details"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "var(--onyx)",
              border: "none",
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--white-2)",
              fontSize: 20,
              cursor: "pointer",
              opacity: 0.75,
              transition: "opacity 0.2s",
              zIndex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.75)}
          >
            <IoCloseOutline />
          </button>

          {/* ── Gallery / Banner ─────────────────────────────────── */}
          <GalleryViewer
            thumbnail={image}
            banner={bannerImage?.url ? bannerImage : null}
            gallery={gallery}
          />

          {/* ── Title + Category ─────────────────────────────────── */}
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <h2
              className="h2"
              style={{
                fontSize: "var(--fs-1)",
                color: "var(--white-2)",
                marginBottom: 8,
                paddingRight: 40,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
            {category?.name && (
              <span
                style={{
                  display: "inline-block",
                  background: "var(--onyx)",
                  color: "var(--light-gray)",
                  fontSize: "var(--fs-8)",
                  fontWeight: 300,
                  padding: "3px 12px",
                  borderRadius: 8,
                  textTransform: "capitalize",
                }}
              >
                {category.name}
              </span>
            )}
          </div>

          {/* ── Separator ────────────────────────────────────────── */}
          <div className="separator" />

          {/* ── Description ──────────────────────────────────────── */}
          {description && (
            <section style={{ marginBottom: 24 }}>
              <SectionHeading>About This Project</SectionHeading>
              <p
                style={{
                  color: "var(--light-gray)",
                  fontSize: "var(--fs-6)",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {description}
              </p>
            </section>
          )}

          {/* ── Technologies ─────────────────────────────────────── */}
          {technologies.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionHeading>Technologies Used</SectionHeading>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {technologies.map((tech, idx) => (
                  <TechBadge key={idx} label={tech} />
                ))}
              </div>
            </section>
          )}

          {/* ── Key Features ─────────────────────────────────────── */}
          {features.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionHeading>Key Features</SectionHeading>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "8px 16px",
                }}
              >
                {features.map((feat, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      color: "var(--light-gray)",
                      fontSize: "var(--fs-6)",
                      fontWeight: 300,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--orange-yellow-crayola)",
                        fontWeight: 600,
                        flexShrink: 0,
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      ✓
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Challenges & Solutions ────────────────────────────── */}
          {hasChallengeSection && (
            <section style={{ marginBottom: 24 }}>
              <SectionHeading>Challenges &amp; Solutions</SectionHeading>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {challenge?.trim() && (
                  <div
                    style={{
                      position: "relative",
                      background: "var(--border-gradient-onyx)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      boxShadow: "var(--shadow-2)",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 1,
                        background: "var(--bg-gradient-jet)",
                        borderRadius: "inherit",
                        zIndex: -1,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "var(--fs-7)",
                        fontWeight: 600,
                        color: "var(--vegas-gold)",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Challenge
                    </p>
                    <p
                      style={{
                        color: "var(--light-gray)",
                        fontSize: "var(--fs-6)",
                        fontWeight: 300,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {challenge}
                    </p>
                  </div>
                )}
                {solution?.trim() && (
                  <div
                    style={{
                      position: "relative",
                      background: "var(--border-gradient-onyx)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      boxShadow: "var(--shadow-2)",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 1,
                        background: "var(--bg-gradient-jet)",
                        borderRadius: "inherit",
                        zIndex: -1,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "var(--fs-7)",
                        fontWeight: 600,
                        color: "var(--orange-yellow-crayola)",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Solution
                    </p>
                    <p
                      style={{
                        color: "var(--light-gray)",
                        fontSize: "var(--fs-6)",
                        fontWeight: 300,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {solution}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Action Buttons ────────────────────────────────────── */}
          {(resolvedLiveUrl || githubUrl) && (
            <>
              <div className="separator" />
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 4,
                  paddingTop: 4,
                }}
              >
                {resolvedLiveUrl && (
                  <a
                    href={resolvedLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 22px",
                      fontSize: "var(--fs-6)",
                      textDecoration: "none",
                      flex: "1 1 auto",
                      justifyContent: "center",
                      minWidth: 140,
                      maxWidth: 260,
                    }}
                  >
                    <IoOpenOutline style={{ fontSize: 17, flexShrink: 0 }} />
                    View Live Project
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 22px",
                      borderRadius: 14,
                      fontSize: "var(--fs-6)",
                      fontWeight: 500,
                      textDecoration: "none",
                      color: "var(--light-gray)",
                      border: "1px solid var(--jet)",
                      background: "var(--onyx)",
                      transition:
                        "border-color var(--transition-1), color var(--transition-1)",
                      flex: "1 1 auto",
                      justifyContent: "center",
                      minWidth: 140,
                      maxWidth: 260,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--orange-yellow-crayola)";
                      e.currentTarget.style.color =
                        "var(--orange-yellow-crayola)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--jet)";
                      e.currentTarget.style.color = "var(--light-gray)";
                    }}
                  >
                    <IoLogoGithub style={{ fontSize: 18, flexShrink: 0 }} />
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
