import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicSiteSettings } from "../../hooks/usePublicSite";

const DISMISS_KEY = "announcement_bar_dismissed_v1";

/**
 * CMS-driven announcement bar rendered above the Navbar.
 *
 * Data source: SiteSettings.announcementBar
 *   { enabled, message, ctaLabel, ctaUrl, backgroundColor, textColor, dismissible }
 *
 * Dismissal: stored in sessionStorage so the bar re-appears on each new
 * browser session (new tab / window) but stays gone for the current one.
 *
 * Resilience: if SiteSettings query hasn't resolved yet, or
 * announcementBar.enabled is false, renders nothing — no layout shift.
 */
export default function AnnouncementBar() {
  const { data: settings } = usePublicSiteSettings();
  const bar = settings?.announcementBar;

  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Not enabled, still loading, or already dismissed — render nothing.
  if (!bar?.enabled || dismissed) return null;

  const bg = bar.backgroundColor || "#00ff88";
  const fg = bar.textColor || "#1c1c1e";

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* sessionStorage blocked — dismiss only for this render */
    }
    setDismissed(true);
  };

  // CTA link: internal (React Router Link) or external (plain <a>)
  const isExternalCta =
    bar.ctaUrl && /^https?:\/\//.test(bar.ctaUrl);

  const ctaNode =
    bar.ctaLabel && bar.ctaUrl ? (
      isExternalCta ? (
        <a
          href={bar.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-bold underline whitespace-nowrap ml-3 flex-shrink-0"
          style={{ color: fg }}
        >
          {bar.ctaLabel} →
        </a>
      ) : (
        <Link
          to={bar.ctaUrl}
          className="font-mono text-xs font-bold underline whitespace-nowrap ml-3 flex-shrink-0"
          style={{ color: fg, textDecoration: "underline" }}
        >
          {bar.ctaLabel} →
        </Link>
      )
    ) : null;

  return (
    <div
      role="banner"
      aria-label="Announcement"
      className="w-full flex items-center justify-center gap-2 px-4 py-2 relative"
      style={{ backgroundColor: bg, color: fg, minHeight: 36 }}
    >
      <p className="font-mono text-xs text-center leading-snug flex-1 max-w-3xl">
        {bar.message}
        {ctaNode}
      </p>

      {bar.dismissible !== false && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full opacity-60 hover:opacity-100 transition-opacity border-0 cursor-pointer flex-shrink-0"
          style={{ backgroundColor: "transparent", color: fg, fontSize: 16, lineHeight: 1 }}
        >
          ×
        </button>
      )}
    </div>
  );
}
