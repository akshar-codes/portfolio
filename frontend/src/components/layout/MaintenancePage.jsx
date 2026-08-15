import { Link } from "react-router-dom";
import { usePublicSiteSettings } from "../../hooks/usePublicSite";

/**
 * Full-viewport maintenance screen.
 *
 * Rendered by PublicLayout when SiteSettings.maintenanceMode === true.
 * Suppresses the entire public site (Navbar, main content, Footer) and
 * shows the CMS-configured `maintenanceMessage` instead.
 *
 * Admins are intentionally NOT allowed through here automatically —
 * maintenance mode should be tested and disabled via the admin panel
 * before the public site is restored. This keeps the behaviour simple,
 * auditable, and free of "magic admin bypass" edge cases.
 */
export default function MaintenancePage() {
  const { data: settings } = usePublicSiteSettings();

  const siteName = settings?.siteName || "Portfolio";
  const logoUrl = settings?.logo?.url || "";
  const message =
    settings?.maintenanceMessage ||
    "We'll be back shortly. Thanks for your patience.";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Logo / site name */}
      <Link to="/" className="flex items-center gap-2 no-underline mb-10" style={{ textDecoration: "none" }}>
        {logoUrl ? (
          <img src={logoUrl} alt={siteName} style={{ height: 40, width: "auto" }} />
        ) : (
          <>
            <span className="font-mono text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {siteName}
            </span>
            <span className="font-mono text-4xl font-black" style={{ color: "var(--accent)", lineHeight: 1 }}>
              .
            </span>
          </>
        )}
      </Link>

      {/* Animated wrench icon */}
      <div className="mb-6" style={{ fontSize: 56 }} role="img" aria-label="Under maintenance">
        🔧
      </div>

      <h1 className="font-mono text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Under Maintenance
      </h1>

      <p
        className="font-mono text-sm leading-relaxed max-w-md"
        style={{ color: "var(--text-secondary)" }}
      >
        {message}
      </p>
    </div>
  );
}
