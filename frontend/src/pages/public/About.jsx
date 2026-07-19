import { useAbout } from "../../hooks/useAbout";
import { resolveAboutIcon } from "../../utils/aboutIconMap";

/* ------------------------------------------------------------------ *
 * Loading skeleton — mirrors the real content structure exactly so
 * there is no layout shift when data arrives.
 * Uses the existing a-shimmer keyframe from index.css.
 * ------------------------------------------------------------------ */
function AboutSkeleton() {
  return (
    <article className="about active">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      {/* Paragraph skeletons */}
      <section className="about-text">
        {[90, 100, 80].map((w, i) => (
          <div
            key={i}
            style={{
              height: 14,
              width: `${w}%`,
              background: "var(--jet)",
              borderRadius: 4,
              marginBottom: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.045) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "a-shimmer 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </section>

      {/* Service card skeletons */}
      <section className="service">
        <h3 className="h3 service-title">What I'm doing</h3>
        <ul className="service-list">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="service-item">
              <div
                className="service-icon-box"
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--jet)",
                  borderRadius: 8,
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.045) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "a-shimmer 1.5s ease-in-out infinite",
                  }}
                />
              </div>
              <div className="service-content-box" style={{ flex: 1 }}>
                <div
                  style={{
                    height: 15,
                    width: "60%",
                    background: "var(--jet)",
                    borderRadius: 4,
                    marginBottom: 8,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.045) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "a-shimmer 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 13,
                    width: "90%",
                    background: "var(--jet)",
                    borderRadius: 4,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.045) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "a-shimmer 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Main About component
 * ------------------------------------------------------------------ */
export default function About() {
  const { data: about, isLoading, isError } = useAbout();

  /* ── Loading ──────────────────────────────────────────────────── */
  if (isLoading) return <AboutSkeleton />;

  /* ── Error — render the section headings so the layout is stable ── */
  if (isError) {
    return (
      <article className="about active">
        <header>
          <h2 className="h2 article-title">About me</h2>
        </header>
        <section className="about-text">
          <p
            style={{
              color: "var(--bittersweet-shimmer)",
              fontSize: "var(--fs-6)",
            }}
          >
            Could not load content. Please refresh the page.
          </p>
        </section>
      </article>
    );
  }

  const paragraphs = about?.paragraphs ?? [];
  const services = about?.services ?? [];

  /* ── Ready ────────────────────────────────────────────────────── */
  return (
    <article className="about active">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      {/* ── About text paragraphs ─────────────────────────────── */}
      {paragraphs.length > 0 && (
        <section className="about-text">
          {paragraphs.map((para) => (
            <p key={para._id}>{para.text}</p>
          ))}
        </section>
      )}

      {/* ── Service cards ─────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="service">
          <h3 className="h3 service-title">What I'm doing</h3>

          <ul className="service-list">
            {services.map((service) => (
              <li key={service._id} className="service-item">
                <div className="service-icon-box">
                  <img
                    src={resolveAboutIcon(service.icon)}
                    alt={service.title}
                    width="40"
                  />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">{service.title}</h4>
                  <p className="service-item-text">{service.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
