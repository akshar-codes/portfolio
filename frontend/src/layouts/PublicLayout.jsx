import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import MaintenancePage from "../components/layout/MaintenancePage";
import { usePublicSiteSettings } from "../hooks/usePublicSite";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAnalytics } from "../hooks/useAnalytics";

export default function PublicLayout() {
  const { data: settings } = usePublicSiteSettings();

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
  useAnalytics(settings);

  // ── Maintenance mode ───────────────────────────────────────────────
  // When maintenance mode is active the entire public site is replaced
  // by a full-viewport maintenance screen. AnnouncementBar and regular
  // chrome are suppressed to avoid a confusing half-rendered state.
  if (settings?.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Announcement bar sits above the sticky Navbar so it scrolls away
          while the Navbar stays fixed — preserves the sticky UX. */}
      <AnnouncementBar />
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
