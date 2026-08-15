import { useState } from "react";
import { SouthWest as SouthWestIcon, NorthEast as NorthEastIcon } from "@mui/icons-material";

import { useAbout } from "../../hooks/useAbout";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { excerptFromHtml } from "../../utils/html";
import { SkeletonGrid, SkeletonPillRow, SkeletonText, SkeletonBlock } from "../../components/public/Skeletons";
import { PublicError, PublicEmpty } from "../../components/public/StatusStates";

/**
 * Public "About" content. Reachable at /services — there is no
 * dedicated /about route in this app, and the Navigation singleton
 * (see components/layout/Navbar.jsx) drives the *label* shown for
 * this route independently of its path, so this can be labelled
 * "About" (or anything else) from the admin panel without a route
 * change here.
 *
 * The original service-card grid layout/markup is preserved exactly
 * (ServiceCard below is unchanged) — Biography, Skills, Highlights,
 * and Timeline are new sections appended beneath it to cover the rest
 * of the About singleton's content, styled with the same design
 * tokens the rest of the site already uses.
 */
export default function Services() {
  const { data: about, isLoading, isError, error, refetch } = useAbout();
  const { data: seo } = usePublicSeo();

  const pageDescription = about?.biography
    ? excerptFromHtml(about.biography)
    : seo?.defaultMetaDescription;

  const canonical = seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/services` : "";

  useDocumentHead(
    buildPageSeo(seo, {
      pageTitle: seo?.defaultMetaTitle ? `About — ${seo.defaultMetaTitle}` : "About",
      pageDescription,
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
            name: "About",
            item: canonical,
          },
        ],
      }
    : null;

  const aboutPageSchema = canonical
    ? {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About",
        url: canonical,
        description: pageDescription,
      }
    : null;

  useStructuredData([breadcrumbSchema, aboutPageSchema].filter(Boolean));

  if (isError) {
    return (
      <div className="page-enter">
        <section className="section-container py-16">
          <PublicError message={error?.message} onRetry={refetch} />
        </section>
      </div>
    );
  }

  const services = [...(about?.services ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const timeline = [...(about?.timeline ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const highlights = [...(about?.highlights ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const skillsSummary = about?.skillsSummary ?? [];

  return (
    <div className="page-enter">
      {/* ── Services grid — unchanged layout ─────────────────────── */}
      <section className="section-container py-16">
        {isLoading && <SkeletonGrid count={4} cardLines={3} />}

        {!isLoading && services.length === 0 && (
          <PublicEmpty icon="🧰" title="No services listed yet" />
        )}

        {!isLoading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {services.map((service, index) => (
              <ServiceCard key={service._id ?? service.title} service={service} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* ── Biography ─────────────────────────────────────────────── */}
      {(isLoading || about?.biography) && (
        <section className="section-container pb-16">
          <h2 className="font-mono text-3xl md:text-4xl font-bold mb-6" style={{ color: "var(--accent)" }}>
            About Me
          </h2>
          {isLoading ? (
            <SkeletonText lines={4} className="max-w-2xl" />
          ) : (
            <div
              className="font-mono text-sm leading-relaxed max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
              dangerouslySetInnerHTML={{ __html: about.biography }}
            />
          )}
        </section>
      )}

      {/* ── Skills summary ────────────────────────────────────────── */}
      {(isLoading || skillsSummary.length > 0) && (
        <section className="section-container pb-16">
          <h3 className="font-mono text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: "var(--accent)" }}>
            Skills
          </h3>
          {isLoading ? (
            <SkeletonPillRow count={6} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillsSummary.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-1.5 rounded-full font-mono text-xs font-medium"
                  style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Highlights ────────────────────────────────────────────── */}
      {(isLoading || highlights.length > 0) && (
        <section className="section-container pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <SkeletonBlock className="h-8 w-16" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                ))
              : highlights.map((h) => (
                  <div key={h._id ?? h.label}>
                    <p className="font-mono text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                      {h.value}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {h.label}
                    </p>
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* ── Timeline ──────────────────────────────────────────────── */}
      {(isLoading || timeline.length > 0) && (
        <section className="section-container pb-16">
          <h2 className="font-mono text-3xl md:text-4xl font-bold mb-6" style={{ color: "var(--accent)" }}>
            Journey
          </h2>
          {isLoading ? (
            <SkeletonGrid count={3} cardLines={2} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {timeline.map((entry) => (
                <div
                  key={entry._id ?? entry.title}
                  className="rounded-xl p-6 flex flex-col gap-2"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>
                    {entry.dateRange}
                  </span>
                  <h3 className="font-mono text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {entry.title}
                  </h3>
                  {entry.subtitle && (
                    <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {entry.subtitle}
                    </p>
                  )}
                  {entry.description && (
                    <p className="font-mono text-sm leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
                      {entry.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group flex flex-col gap-4 py-12 px-6 cursor-pointer transition-colors duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span
          className="outlined-number transition-all duration-300"
          style={{ WebkitTextStroke: hovered ? "2px var(--accent)" : "2px rgba(255,255,255,0.25)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div
          className="arrow-btn transition-all duration-300"
          style={{
            backgroundColor: hovered ? "var(--accent)" : "#ffffff",
            color: "#1c1c1e",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {hovered ? <NorthEastIcon sx={{ fontSize: 22 }} /> : <SouthWestIcon sx={{ fontSize: 22 }} />}
        </div>
      </div>

      <h2
        className="font-mono text-2xl md:text-3xl font-bold mt-2 transition-colors duration-300"
        style={{ color: hovered ? "var(--accent)" : "var(--text-primary)" }}
      >
        {service.title}
      </h2>

      <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {service.description}
      </p>

      <hr className="section-divider mt-4" />
    </div>
  );
}
