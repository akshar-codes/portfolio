import { useState } from "react";
import {
  IoChevronDown,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useProfile } from "../../hooks/useProfile";
import { resolveIcon } from "../../utils/iconMap";

/* ─────────────────────────────────────────────────────────────────── *
 * Shimmer skeleton block
 * ─────────────────────────────────────────────────────────────────── */
function Skeleton({ width, height, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: 4,
        background: "var(--jet)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
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
  );
}

function ContactItem({ icon: Icon, title, loading, children }) {
  return (
    <li className="contact-item">
      <div className="icon-box" aria-hidden="true">
        <Icon />
      </div>
      <div className="contact-info">
        <p className="contact-title">{title}</p>
        {loading ? (
          <Skeleton width={120} height={13} style={{ marginTop: 2 }} />
        ) : (
          children
        )}
      </div>
    </li>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: profile, isLoading } = useProfile();

  const name = profile?.name ?? "";
  const title = profile?.title ?? "";
  const email = profile?.email ?? "";
  const phone = profile?.phone ?? "";
  const location = profile?.location ?? "";
  const avatar = profile?.avatar || "/images/my-avatar.png";

  // Sort social links by the persisted order field
  const links = [...(profile?.socialLinks ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <aside
      className={`sidebar ${isOpen ? "active" : ""}`}
      aria-label="Profile and contact information"
    >
      {/* ── Top info row ────────────────────────────────────────── */}
      <div className="sidebar-info">
        <figure className="avatar-box">
          {isLoading ? (
            <div className="avatar-skeleton">
              <Skeleton width="100%" height="100%" />
            </div>
          ) : (
            <img src={avatar} alt={name} width="80" />
          )}
        </figure>

        <div className="info-content" style={{ minWidth: 0 }}>
          {isLoading ? (
            <>
              <Skeleton width={140} height={18} style={{ marginBottom: 10 }} />
              <Skeleton width={90} height={22} style={{ borderRadius: 8 }} />
            </>
          ) : (
            <>
              <h1 className="name" title={name}>
                {name}
              </h1>
              <p className="title">{title}</p>
            </>
          )}
        </div>

        <button
          className="info_more-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="sidebar-contacts"
        >
          <span>{isOpen ? "Hide Contacts" : "Show Contacts"}</span>
          <IoChevronDown aria-hidden="true" />
        </button>
      </div>

      {/* ── Expandable contact section ───────────────────────────── */}
      <div
        id="sidebar-contacts"
        className="sidebar-info_more"
        aria-hidden={!isOpen}
      >
        <div className="separator" role="separator" />

        <ul className="contacts-list" role="list">
          <ContactItem icon={IoMailOutline} title="Email" loading={isLoading}>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="contact-link"
                aria-label={`Send email to ${email}`}
              >
                {email.includes("@") ? (
                  <>
                    {email.split("@")[0]}
                    <br />@{email.split("@")[1]}
                  </>
                ) : (
                  email
                )}
              </a>
            ) : (
              <span className="contact-link" style={{ opacity: 0.4 }}>
                —
              </span>
            )}
          </ContactItem>

          <ContactItem
            icon={IoPhonePortraitOutline}
            title="Phone"
            loading={isLoading}
          >
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="contact-link"
                aria-label={`Call ${phone}`}
              >
                {phone}
              </a>
            ) : (
              <span className="contact-link" style={{ opacity: 0.4 }}>
                —
              </span>
            )}
          </ContactItem>

          <ContactItem
            icon={IoLocationOutline}
            title="Location"
            loading={isLoading}
          >
            {location ? (
              <address>{location}</address>
            ) : (
              <address style={{ opacity: 0.4 }}>—</address>
            )}
          </ContactItem>
        </ul>

        <div className="separator" role="separator" />

        <ul
          className="social-list"
          role="list"
          aria-label="Social media links"
          style={{ minHeight: 26 }}
        >
          {isLoading ? (
            <>
              <li className="social-item">
                <Skeleton
                  width={18}
                  height={18}
                  style={{ borderRadius: "50%" }}
                />
              </li>
              <li className="social-item">
                <Skeleton
                  width={18}
                  height={18}
                  style={{ borderRadius: "50%" }}
                />
              </li>
            </>
          ) : (
            // Links are pre-sorted by the order field above
            links.map((link) => {
              const Icon = resolveIcon(link.icon);
              return (
                <li key={link._id} className="social-item">
                  <a
                    href={link.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} — opens in new tab`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </aside>
  );
}
