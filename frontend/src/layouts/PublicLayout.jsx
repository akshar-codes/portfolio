import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { usePublicSiteSettings } from "../hooks/usePublicSite";

export default function PublicLayout() {
  const { data: settings } = usePublicSiteSettings();
  const faviconUrl = settings?.favicon?.url;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
