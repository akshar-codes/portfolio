import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation, usePublicSiteSettings } from "../../hooks/usePublicSite";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { SkeletonBlock } from "../public/Skeletons";

/**
 * Site-wide navigation, fully CMS-driven via the Navigation singleton
 * (labels, paths, order, visibility, external/new-tab flags, one level
 * of dropdown children) and the SiteSettings singleton (site name).
 *
 * Resilience note: if either query fails or the resource is a
 * currently-unpublished draft (404 CONTENT_NOT_PUBLISHED), the nav
 * degrades to "logo only" rather than showing a full error block —
 * broken site-wide chrome would take the whole site down with it, and
 * a stale/hardcoded fallback link list would violate "no hardcoded
 * content" for no real benefit.
 */
export default function Navbar() {
  const location = useLocation();
  const { isPreview } = usePreviewMode();
  const { data: nav, isLoading: navLoading } = usePublicNavigation({ preview: isPreview });
  const { data: settings } = usePublicSiteSettings({ preview: isPreview });

  const [openDesktopId, setOpenDesktopId] = useState(null);

  const isActive = (path) => {
    if (!path || path.startsWith("http")) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const visibleItems = (nav?.items ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      ...item,
      children: (item.children ?? [])
        .filter((c) => c.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));

  const siteName = settings?.siteName || "Portfolio";
  const logoUrl = settings?.logo?.url || "";

  const renderLink = (item, extraClassName = "") => {
    const active = isActive(item.path);
    const commonProps = {
      className: `relative no-underline text-sm font-medium transition-colors duration-200 ${extraClassName}`,
      style: {
        textDecoration: "none",
        color: active ? "var(--accent)" : "var(--text-primary)",
        fontFamily: "Inter, sans-serif",
      },
      "aria-current": active ? "page" : undefined,
      "aria-haspopup": item.children?.length ? "true" : undefined,
      "aria-expanded": item.children?.length ? openDesktopId === (item._id ?? item.path) : undefined,
    };

    const content = (
      <>
        {item.label}
        {active && (
          <span
            className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
          />
        )}
      </>
    );

    if (item.isExternal) {
      return (
        <a
          href={item.path}
          target={item.openInNewTab ? "_blank" : undefined}
          rel={item.openInNewTab ? "noopener noreferrer" : undefined}
          {...commonProps}
        >
          {content}
        </a>
      );
    }

    return (
      <Link to={item.path} {...commonProps}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid transparent" }}
      >
        <nav aria-label="Primary" className="section-container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 no-underline" style={{ textDecoration: "none" }}>
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: 34, width: "auto" }} />
            ) : (
              <>
                <span className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {siteName}
                </span>
                <span className="font-mono text-3xl font-black" style={{ color: "var(--accent)", lineHeight: 1 }}>
                  .
                </span>
              </>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLoading && (
              <div className="flex items-center gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBlock key={i} className="h-3 w-14" />
                ))}
              </div>
            )}

            {!navLoading &&
              visibleItems.map((item) => {
                const hasChildren = item.children.length > 0;
                if (!hasChildren) {
                  return <span key={item._id ?? item.path}>{renderLink(item)}</span>;
                }
                return (
                  <div
                    key={item._id ?? item.path}
                    className="relative"
                    onMouseEnter={() => setOpenDesktopId(item._id ?? item.path)}
                    onMouseLeave={() => setOpenDesktopId(null)}
                    onFocus={() => setOpenDesktopId(item._id ?? item.path)}
                    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenDesktopId(null); }}
                    onKeyDown={(event) => { if (event.key === "Escape") setOpenDesktopId(null); }}
                  >
                    {renderLink(item)}
                    {openDesktopId === (item._id ?? item.path) && (
                      <div
                        role="group"
                        aria-label={`${item.label} links`}
                        className="absolute top-full left-0 mt-3 py-2 rounded-xl"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                          minWidth: 180,
                          boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                        }}
                      >
                        {item.children.map((child) => (
                          <div key={child._id ?? child.path} className="px-4 py-1.5">
                            {renderLink(child)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Resume download CTA — shown when enabled in Site Settings.
                Rendered as a subtle outlined link (distinct from the solid
                nav CTA) so the two don't compete visually. Desktop-only:
                the mobile bottom-tab bar is too narrow for an extra item. */}
            {settings?.resumeDownload?.enabled && settings?.resumeDownload?.url && (
              <a
                href={settings.resumeDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                style={{
                    display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 20px", borderRadius: 9999,
                    backgroundColor: "transparent",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)",
                    fontFamily: "Inter, sans-serif",
                    textDecoration: "none", fontWeight: 600,
                  }}
                aria-label={`${settings.resumeDownload.label || "Download CV"} (opens in a new tab)`}
              >
                {settings.resumeDownload.label || "Download CV"}
              </a>
            )}

            {nav?.ctaEnabled && nav?.ctaUrl && (
              <Link to={nav.ctaUrl} className="no-underline" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 24px", borderRadius: 9999, textDecoration: "none", fontSize: 14, fontWeight: 600, backgroundColor: "var(--accent)", color: "#1c1c1e", fontFamily: "Inter, sans-serif" }}>
                  {nav.ctaLabel || "Contact"}
              </Link>
            )}
          </div>
        </nav>
      </header>


      <nav
        className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch justify-around rounded-t-2xl overflow-x-auto"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.35)",
        }}
        aria-label="Primary"
      >
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          return item.isExternal ? (
            <a
              key={item._id ?? item.path}
              href={item.path}
              target={item.openInNewTab ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-4 no-underline text-xs font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap px-3"
              style={{
                textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item._id ?? item.path}
              to={item.path}
              className="flex-1 flex items-center justify-center py-4 no-underline text-xs font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap px-3"
              style={{
                textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "Inter, sans-serif",
              }}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
