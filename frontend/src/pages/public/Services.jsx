import { useState } from "react";
import { SouthWest as SouthWestIcon, NorthEast as NorthEastIcon } from "@mui/icons-material";

import { useAbout } from "../../hooks/useAbout";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { excerptFromHtml } from "../../utils/html";
import { SkeletonGrid } from "../../components/public/Skeletons";
import { PublicError, PublicEmpty } from "../../components/public/StatusStates";

export default function Services() {
  const { isPreview } = usePreviewMode();
  const { data: about, isLoading, isError, error, refetch } = useAbout({ preview: isPreview });
  const { data: seo } = usePublicSeo({ preview: isPreview });
  const description = about?.biography
    ? excerptFromHtml(about.biography)
    : seo?.defaultMetaDescription;
  const canonical = seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/services` : "";

  useDocumentHead(buildPageSeo(seo, {
    pageTitle: seo?.defaultMetaTitle ? `Services — ${seo.defaultMetaTitle}` : "Services",
    pageDescription: description,
    pageCanonical: canonical,
  }));

  useStructuredData(canonical ? [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: seo?.canonicalBaseUrl || "" },
      { "@type": "ListItem", position: 2, name: "Services", item: canonical },
    ],
  }] : null);

  if (isError) {
    return <div className="page-enter"><section className="section-container py-16"><PublicError message={error?.message} onRetry={refetch} /></section></div>;
  }

  const services = [...(about?.services ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="page-enter">
      <section className="section-container py-16">
        {isLoading && <SkeletonGrid count={4} cardLines={3} />}
        {!isLoading && services.length === 0 && <PublicEmpty icon="🧰" title="No services listed yet" />}
        {!isLoading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {services.map((service, index) => <ServiceCard key={service._id ?? service.title} service={service} index={index} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="relative group flex flex-col gap-4 py-12 px-6 transition-colors duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span className="outlined-number transition-all duration-300" style={{ WebkitTextStroke: hovered ? "2px var(--accent)" : "2px rgba(255,255,255,0.25)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="arrow-btn transition-all duration-300" style={{ backgroundColor: hovered ? "var(--accent)" : "#ffffff", color: "#1c1c1e", transform: hovered ? "scale(1.1)" : "scale(1)" }}>
          {hovered ? <NorthEastIcon sx={{ fontSize: 22 }} /> : <SouthWestIcon sx={{ fontSize: 22 }} />}
        </div>
      </div>
      <h2 className="font-mono text-2xl md:text-3xl font-bold mt-2 transition-colors duration-300" style={{ color: hovered ? "var(--accent)" : "var(--text-primary)" }}>
        {service.title}
      </h2>
      <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{service.description}</p>
      <hr className="section-divider mt-4" />
    </article>
  );
}
