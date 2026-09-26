import { useEffect, useState, useRef } from "react";
import { Download as DownloadIcon } from "@mui/icons-material";

import { useProfile } from "../../hooks/useProfile";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { resolveIcon } from "../../utils/iconMap";
import { getInitials } from "../../utils/strings";
import { excerptFromHtml } from "../../utils/html";
import { getThumbnailUrl } from "../../utils/cloudinaryTransform";
import { SkeletonAvatar, SkeletonBlock, SkeletonText } from "../../components/public/Skeletons";
import { PublicError } from "../../components/public/StatusStates";

function useCountUp(target, duration = 1600, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = null;
    let raf;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);

  return count;
}

function StatItem({ value, suffix, label, started }) {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="flex items-center gap-3">
      <span className="stat-number">
        {count}
        {suffix}
      </span>
      <span className="text-sm leading-tight" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

const CTA_STYLE = {
  primary: { backgroundColor: "var(--accent)", color: "#1c1c1e", border: "2px solid var(--accent)" },
  secondary: { backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "2px solid var(--border)" },
  outline: { backgroundColor: "transparent", color: "var(--text-primary)", border: "2px solid var(--text-primary)" },
};

function CtaButton({ button }) {
  const isDownload = /\.(pdf|docx?|zip)$/i.test(button.url);
  return (
    <a
      href={button.url}
      target={button.openInNewTab ? "_blank" : undefined}
      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
      download={isDownload || undefined}
      className="no-underline"
      style={{ textDecoration: "none" }}
    >
      <button
        className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm font-semibold cursor-pointer transition-all duration-200"
        style={{ ...CTA_STYLE[button.style ?? "outline"], letterSpacing: "0.1em" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = button.style === "primary" ? "#1c1c1e" : "var(--accent)";
        }}
        onMouseLeave={(e) => {
          const base = CTA_STYLE[button.style ?? "outline"];
          e.currentTarget.style.borderColor = base.border.split(" ").pop();
          e.currentTarget.style.color = base.color;
        }}
      >
        {button.label.toUpperCase()}
        {isDownload && <DownloadIcon fontSize="small" />}
      </button>
    </a>
  );
}

export default function Home() {
  const { isPreview } = usePreviewMode();
  const { data: profile, isLoading, isError, error, refetch } = useProfile({ preview: isPreview });
  const { data: seo } = usePublicSeo({ preview: isPreview });

  const [statsVisible, setStatsVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const statsRef = useRef(null);

  const typingStrings = profile
    ? [...new Set([profile.name, profile.title].filter(Boolean))]
    : [];

  useEffect(() => {
    if (typingStrings.length === 0) return;
    const current = typingStrings[stringIndex % typingStrings.length];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 80);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 40);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setStringIndex((i) => (i + 1) % typingStrings.length);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIndex, deleting, stringIndex, typingStrings.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [profile]);

  const pageTitle = profile
    ? `${profile.name} | ${profile.title}`
    : seo?.defaultMetaTitle;

  const pageDescription = profile?.introduction
    ? excerptFromHtml(profile.introduction)
    : seo?.defaultMetaDescription;

  useDocumentHead(
    buildPageSeo(seo, {
      pageTitle,
      pageDescription,
      pageCanonical: seo?.canonicalBaseUrl || "",
      pageOgType: "profile",
    }),
  );

  // ── Structured Data ────────────────────────────────────────────────
  const personSchema = profile
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        jobTitle: profile.title,
        description: pageDescription,
        url: seo?.canonicalBaseUrl || "",
        image: profile.avatarUrl || "",
        sameAs: (profile.socialLinks ?? []).map((l) => l.url).filter(Boolean),
      }
    : null;

  const websiteSchema = seo?.canonicalBaseUrl
    ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: profile?.name || seo?.defaultMetaTitle || "",
        url: seo.canonicalBaseUrl,
      }
    : null;

  useStructuredData([personSchema, websiteSchema].filter(Boolean));

  if (isError) {
    return (
      <div className="page-enter">
        <section className="section-container py-16">
          <PublicError message={error?.message} onRetry={refetch} />
        </section>
      </div>
    );
  }

  const socialLinks = [...(profile?.socialLinks ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const ctaButtons = [...(profile?.ctaButtons ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const statistics = [...(profile?.statistics ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="page-enter md:h-[calc(100vh-80px)] md:overflow-hidden">
      <section className="section-container h-auto md:h-full flex flex-col justify-center py-8">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 max-w-xl">
              <p className="font-mono text-sm tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
                {isLoading ? <SkeletonBlock className="h-3 w-40" /> : profile?.title}
              </p>

              <h1
                className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Hello I&apos;m
              </h1>

              <h2
                className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: "var(--accent)", minHeight: "1.2em" }}
              >
                {isLoading ? (
                  <SkeletonBlock className="h-10 w-64" />
                ) : (
                  <>
                    {typedText}
                    <span
                      className="inline-block w-0.5 h-10 ml-1 align-middle"
                      style={{ backgroundColor: "var(--accent)", animation: "blink 1s step-end infinite" }}
                    />
                  </>
                )}
              </h2>

              {isLoading ? (
                <SkeletonText lines={3} className="mb-8 max-w-md" />
              ) : (
                profile?.introduction && (
                  <div
                    className="font-mono text-sm leading-relaxed mb-8 max-w-md"
                    style={{ color: "var(--text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: profile.introduction }}
                  />
                )
              )}

              <div className="flex flex-wrap items-center gap-6 mb-10">
                {isLoading ? (
                  <SkeletonBlock className="h-12 w-40 rounded-full" />
                ) : (
                  ctaButtons.map((btn) => <CtaButton key={btn._id ?? btn.label} button={btn} />)
                )}

                {!isLoading && socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    {socialLinks.map((link) => {
                      const Icon = resolveIcon(link.icon);
                      return (
                        <a
                          key={link._id ?? link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                          className="flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 no-underline"
                          style={{ borderColor: "var(--accent)", color: "var(--accent)", backgroundColor: "transparent" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--accent)";
                            e.currentTarget.style.color = "#1c1c1e";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--accent)";
                          }}
                        >
                          <Icon size={18} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <span className="absolute -top-4 left-4 font-mono text-lg font-bold" style={{ color: "var(--accent)" }}>
                —
              </span>
              <span
                className="absolute -top-6 right-2 font-mono text-lg font-bold"
                style={{ color: "var(--accent)", transform: "rotate(45deg)" }}
              >
                /
              </span>
              <span className="absolute top-1/2 -left-6 font-mono text-lg font-bold" style={{ color: "var(--accent)" }}>
                /
              </span>
              <span
                className="absolute top-1/4 -right-8 font-mono text-lg font-bold"
                style={{ color: "var(--accent)", transform: "rotate(-45deg)" }}
              >
                \
              </span>
              <span
                className="absolute bottom-4 -right-4 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />

              {isLoading ? (
                <SkeletonAvatar size={320} />
              ) : (
                <div className="profile-frame relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <svg
                    className="profile-ring absolute inset-0 w-full h-full"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <mask id="ring-mask">
                        <circle
                          cx="150"
                          cy="150"
                          r="146"
                          stroke="white"
                          strokeWidth="10"
                          strokeDasharray="918"
                          strokeDashoffset="918"
                          strokeLinecap="round"
                          transform="rotate(-90 150 150)"
                          className="animate-draw-circle"
                        />
                      </mask>
                    </defs>
                    <circle
                      cx="150"
                      cy="150"
                      r="146"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeDasharray="12 8 24 8"
                      strokeLinecap="round"
                      opacity="0.7"
                      mask="url(#ring-mask)"
                    />
                  </svg>

                  <div className="absolute inset-3 rounded-full overflow-hidden" style={{ border: "2px solid var(--border)" }}>
                    <div
                      className="w-full h-full flex items-end justify-center relative"
                      style={{ background: "linear-gradient(160deg, #2a2a2d 0%, #1c1c1e 60%, #252527 100%)" }}
                    >
                      {profile?.avatar ? (
                        <img src={getThumbnailUrl(profile.avatar, 512)} alt={profile.name} fetchPriority="high" decoding="async" className="w-full h-full object-cover object-top" />
                      ) : (
                        <span
                          className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-bold"
                          style={{ color: "var(--accent)", opacity: 0.25 }}
                        >
                          {getInitials(profile?.name ?? "")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {isLoading &&
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-10 w-14" />
                  <SkeletonText lines={2} />
                </div>
              ))}
            {!isLoading &&
              statistics.map((stat) => (
                <StatItem
                  key={stat._id ?? stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  started={statsVisible}
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
