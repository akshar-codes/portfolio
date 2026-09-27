import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import MaintenancePage from "../components/layout/MaintenancePage";
import { usePublicSiteSettings, usePublicSeo } from "../hooks/usePublicSite";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAnalytics } from "../hooks/useAnalytics";
import { useStructuredData } from "../hooks/useStructuredData";
import { usePreviewMode } from "../hooks/usePreviewMode";
import PreviewBanner from "../components/cms/PreviewBanner";
import { trackPortfolioEvent } from "../utils/portfolioAnalytics";

export default function PublicLayout() {
  const location = useLocation();
  const { isPreview } = usePreviewMode();
  useEffect(() => {
    if (!isPreview) trackPortfolioEvent("page_view");
  }, [isPreview, location.pathname]);
  const { data: settings } = usePublicSiteSettings({ preview: isPreview });
  const { data: seo } = usePublicSeo({ preview: isPreview });

  // ── Global Organization JSON-LD ────────────────────────────────────
  // Emitted once at the layout level (not per-page) because Organization
  // identity doesn't vary across routes. Also injects the free-form
  // `structuredData` blob an admin may have set in the SEO CMS panel.
  const globalSchemas = [];
  if (seo?.organization?.name) {
    globalSchemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: seo.organization.name,
      url: seo.organization.url || seo.canonicalBaseUrl || "",
      logo: seo.organization.logoUrl
        ? {
            "@type": "ImageObject",
            url: seo.organization.logoUrl,
          }
        : undefined,
    });
  }
  if (seo?.structuredData) {
    try {
      const parsed = JSON.parse(seo.structuredData);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      globalSchemas.push(...entries);
    } catch {
      // Invalid JSON in structuredData — silently skip
    }
  }
  useStructuredData(globalSchemas.length ? globalSchemas : null);

  const faviconUrl = settings?.favicon?.url;

  // ── Dynamic favicon ────────────────────────────────────────────────
  // Site-wide, rarely-changing DOM write — kept separate from
  // useDocumentHead (which manages per-page title/description) so the
  // two never fight over effect ordering between a page and its layout.
  useEffect(() => {
    if (!faviconUrl) return;
    let link = document.head.querySelector('link[rel="icon"][data-dynamic="true"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.setAttribute("data-dynamic", "true");
      document.head.appendChild(link);
    }
    link.setAttribute("href", faviconUrl);
  }, [faviconUrl]);

  // ── Dynamic theme colors ───────────────────────────────────────────
  // Writes CMS primaryColor → --accent / --accent-dark CSS variables on
  // :root so the entire design system updates without a rebuild.
  useThemeColors(settings);

  // ── Analytics injection ────────────────────────────────────────────
  // Injects GA4, GTM, Facebook Pixel, Hotjar, and Microsoft Clarity
  // scripts into <head> once per session, guarded against double-injection.
  useAnalytics(isPreview ? null : settings);

  // ── Maintenance mode ───────────────────────────────────────────────
  // When maintenance mode is active the entire public site is replaced
  // by a full-viewport maintenance screen. AnnouncementBar and regular
  // chrome are suppressed to avoid a confusing half-rendered state.
  if (settings?.maintenanceMode && !isPreview) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {isPreview && <PreviewBanner />}
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <span className="sr-only" aria-live="polite" aria-atomic="true">Page: {location.pathname}</span>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
