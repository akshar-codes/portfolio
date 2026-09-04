import { Link } from "react-router-dom";
import { toast } from "sonner";
import { usePublicFooter, usePublicSiteSettings } from "../../hooks/usePublicSite";
import { useProfile } from "../../hooks/useProfile";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { resolveIcon } from "../../utils/iconMap";
import { SkeletonBlock, SkeletonText } from "../public/Skeletons";

function formatAddress(address) {
  if (!address) return "";
  const { line1, line2, city, state, postalCode, country } = address;
  return [line1, line2, [city, state].filter(Boolean).join(", "), postalCode, country]
    .filter(Boolean)
    .join(", ");
}

/**
 * Site-wide footer — columns/links/description/copyright/newsletter/
 * legal links from the Footer singleton, social icons from
 * Profile.socialLinks (gated by Footer.showSocialLinks AND
 * SiteSettings.socialLinksEnabled, matching the admin UI's own documented
 * relationship between those two flags), contact info from SiteSettings
 * (gated by Footer.showContactInfo), and logo/site-name from SiteSettings.
 *
 * Newsletter signup renders the CMS-configured copy, but submission is
 * intentionally inert — the backend Footer.newsletter schema is
 * presentation-only with no subscription/email-provider integration
 * (see backend/src/models/Footer.js), so faking a success state here
 * would misrepresent what actually happens to a visitor's email.
 */
export default function Footer() {
  const { isPreview } = usePreviewMode();
  const { data: footer, isLoading: footerLoading, isError: footerError } = usePublicFooter();
  const { data: settings } = usePublicSiteSettings();
  const { data: profile } = useProfile({ preview: isPreview });

  if (footerError) return null; // degrade silently — see Navbar's resilience note
  if (footerLoading) {
    return (
      <footer className="mt-24 pt-12 pb-28 md:pb-12" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="section-container grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </footer>
    );
  }
  if (!footer) return null;

  const columns = [...(footer.columns ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const showSocial = footer.showSocialLinks !== false && settings?.socialLinksEnabled !== false;
  const socialLinks = [...(profile?.socialLinks ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const showContact = footer.showContactInfo !== false;
  const contactEmail = settings?.contactEmails?.[0]?.email || profile?.email || "";
  const contactPhone = settings?.contactPhones?.[0]?.phone || profile?.phone || "";
  const contactAddress = formatAddress(settings?.contactAddress) || profile?.location || "";
  const newsletter = footer.newsletter ?? {};
  const legalLinks = [...(footer.legalLinks ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const siteName = settings?.siteName || "Portfolio";
  const logoUrl = settings?.logo?.url || "";

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.info("Newsletter signup is coming soon.");
  };

  return (
    <footer className="mt-24 pt-12 pb-28 md:pb-12" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section-container">
        {/* ── Footer logo / site name ──────────────────────────────── */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline" style={{ textDecoration: "none" }}>
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: 30, width: "auto" }} />
            ) : (
              <>
                <span className="font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {siteName}
                </span>
                <span className="font-mono text-2xl font-black" style={{ color: "var(--accent)", lineHeight: 1 }}>
                  .
                </span>
              </>
            )}
          </Link>
        </div>

        {footer.description && (
          <div
            className="font-mono text-sm leading-relaxed max-w-md mb-10"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: footer.description }}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col._id ?? col.title}>
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {col.title}
              </p>
              <ul className="list-none flex flex-col gap-2 p-0 m-0">
                {(col.links ?? []).map((link) => (
                  <li key={link._id ?? link.url}>
                    <a
                      href={link.url}
                      className="font-mono text-sm no-underline transition-colors duration-200"
                      style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {showContact && (contactEmail || contactPhone || contactAddress) && (
            <div>
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Contact
              </p>
              <ul className="list-none flex flex-col gap-2 p-0 m-0">
                {contactEmail && (
                  <li>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-mono text-sm no-underline"
                      style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                    >
                      {contactEmail}
                    </a>
                  </li>
                )}
                {contactPhone && (
                  <li className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {contactPhone}
                  </li>
                )}
                {contactAddress && (
                  <li className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {contactAddress}
                  </li>
                )}
              </ul>
            </div>
          )}

          {newsletter.enabled && (
            <div>
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {newsletter.heading || "Subscribe"}
              </p>
              {newsletter.description && (
                <p
                  className="font-mono text-xs leading-relaxed mb-3"
                  style={{ color: "var(--text-secondary)" }}
                  dangerouslySetInnerHTML={{ __html: newsletter.description }}
                />
              )}
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={newsletter.placeholder || "Enter your email"}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg font-mono text-xs outline-none"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-mono text-xs font-semibold border-0 cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
                >
                  {newsletter.buttonLabel || "Subscribe"}
                </button>
              </form>
            </div>
          )}
        </div>

        {showSocial && socialLinks.length > 0 && (
          <div className="flex items-center gap-3 mt-10">
            {socialLinks.map((link) => {
              const Icon = resolveIcon(link.icon);
              return (
                <a
                  key={link._id ?? link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 no-underline"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        )}

        <hr className="section-divider mt-10 mb-5" />

        {/* ── Bottom bar: copyright + legal links ─────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {footer.copyrightText || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>

          {legalLinks.length > 0 && (
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {legalLinks.map((link) => (
                <a
                  key={link._id ?? link.url}
                  href={link.url}
                  className="font-mono text-xs no-underline transition-colors duration-200"
                  style={{ color: "var(--text-muted)", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
