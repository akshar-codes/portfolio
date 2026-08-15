import { useState } from "react";
import { Download as DownloadIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";

import { useResume } from "../../hooks/useResume";
import { useProfile } from "../../hooks/useProfile";
import { usePublicSeo } from "../../hooks/usePublicSite";
import { useDocumentHead, buildPageSeo } from "../../hooks/useDocumentHead";
import { useStructuredData } from "../../hooks/useStructuredData";
import { excerptFromHtml } from "../../utils/html";
import { SkeletonGrid, SkeletonText, SkeletonBlock } from "../../components/public/Skeletons";
import { PublicError, PublicEmpty } from "../../components/public/StatusStates";

const TABS = ["Experience", "Education", "Certifications", "Skills", "Languages", "Interests", "About me"];

const AVAILABILITY_LABEL = {
  available: "Available for work",
  unavailable: "Not currently available",
  open_to_offers: "Open to offers",
};

function sortByOrder(arr = []) {
  return [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function ItemCard({ dateRange, title, subtitle, description, logo }) {
  return (
    <div
      className="rounded-xl p-7 flex flex-col gap-3 transition-all duration-200"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,255,136,0.3)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="flex items-center justify-between gap-3">
        {dateRange && (
          <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
            {dateRange}
          </span>
        )}
        {logo && <img src={logo} alt="" className="w-8 h-8 rounded object-cover" />}
      </div>
      <h3 className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      {subtitle && (
        <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      )}
      {description && (
        <p
          className="font-mono text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}

export default function Resume() {
  const [activeTab, setActiveTab] = useState("Experience");
  const { data: resume, isLoading, isError, error, refetch } = useResume();
  const { data: profile } = useProfile();
  const { data: seo } = usePublicSeo();

  const pageDescription = resume?.hero?.summary
    ? excerptFromHtml(resume.hero.summary)
    : seo?.defaultMetaDescription;

  const canonical = seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/resume` : "";

  const resumeTitle = profile?.name
    ? `${profile.name} — Resume`
    : seo?.defaultMetaTitle
      ? `Resume — ${seo.defaultMetaTitle}`
      : "Resume";

  useDocumentHead(
    buildPageSeo(seo, {
      pageTitle: resumeTitle,
      pageDescription,
      pageCanonical: canonical,
    }),
  );

  // ── Structured Data ────────────────────────────────────────────────
  const breadcrumbSchema = canonical
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: seo?.canonicalBaseUrl || "",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resume",
            item: canonical,
          },
        ],
      }
    : null;

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

  useStructuredData([breadcrumbSchema, personSchema].filter(Boolean));

  if (isError) {
    return (
      <div className="page-enter">
        <section className="section-container py-16">
          <PublicError message={error?.message} onRetry={refetch} />
        </section>
      </div>
    );
  }

  const hero = resume?.hero ?? {};
  const experience = sortByOrder(resume?.experience);
  const education = sortByOrder(resume?.education);
  const certifications = sortByOrder(resume?.certifications);
  const skills = sortByOrder(resume?.skills);
  const languages = sortByOrder(resume?.languages);
  const interests = sortByOrder(resume?.interests);
  const downloads = sortByOrder(resume?.downloads);
  const primaryDownload = downloads.find((d) => d.fileType === "pdf") ?? downloads[0];

  return (
    <div className="page-enter">
      <section className="section-container pt-16 pb-10">
        {isLoading ? (
          <div className="flex flex-col gap-3 max-w-2xl">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-10 w-80" />
            <SkeletonText lines={2} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              {hero.greeting && (
                <p className="font-mono text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  {hero.greeting}
                </p>
              )}
              {hero.headline && (
                <h1 className="font-mono text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--accent)" }}>
                  {hero.headline}
                </h1>
              )}
              {hero.summary && (
                <div
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                  dangerouslySetInnerHTML={{ __html: hero.summary }}
                />
              )}
              {hero.availabilityStatus && (
                <span
                  className="inline-block mt-3 font-mono text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,255,136,0.1)", color: "var(--accent)", border: "1px solid rgba(0,255,136,0.25)" }}
                >
                  {AVAILABILITY_LABEL[hero.availabilityStatus] ?? hero.availabilityStatus}
                </span>
              )}
            </div>

            {hero.ctaEnabled && primaryDownload && (
              <a href={primaryDownload.url} target="_blank" rel="noopener noreferrer" download className="no-underline">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm font-semibold border-2 cursor-pointer transition-all duration-200 whitespace-nowrap"
                  style={{ borderColor: "var(--text-primary)", color: "var(--text-primary)", backgroundColor: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-primary)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  {(hero.ctaLabel || "Download CV").toUpperCase()}
                  <DownloadIcon fontSize="small" />
                </button>
              </a>
            )}
          </div>
        )}
      </section>

      <section className="section-container py-8">
        <div className="flex flex-col md:flex-row gap-12 min-h-[400px]">
          <aside className="flex flex-col gap-3 md:w-72 flex-shrink-0">
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="w-full py-4 px-5 rounded-lg text-center text-sm font-semibold cursor-pointer border-0 transition-all duration-200"
                  style={{
                    backgroundColor: active ? "var(--accent)" : "var(--bg-card)",
                    color: active ? "#1c1c1e" : "var(--text-primary)",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "#333336";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "var(--bg-card)";
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading && <SkeletonGrid count={4} cardLines={3} />}

            {!isLoading && activeTab === "Experience" && (
              experience.length === 0 ? (
                <PublicEmpty icon="💼" title="No experience listed yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {experience.map((item) => (
                    <ItemCard
                      key={item._id}
                      dateRange={`${item.startDate} — ${item.current ? "Present" : item.endDate}`}
                      title={item.role}
                      subtitle={[item.company, item.location].filter(Boolean).join(" · ")}
                      description={item.description}
                      logo={item.companyLogo}
                    />
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "Education" && (
              education.length === 0 ? (
                <PublicEmpty icon="🎓" title="No education listed yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {education.map((item) => (
                    <ItemCard
                      key={item._id}
                      dateRange={item.duration}
                      title={item.institution}
                      description={item.description}
                    />
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "Certifications" && (
              certifications.length === 0 ? (
                <PublicEmpty icon="📜" title="No certifications listed yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {certifications.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl p-7 flex flex-col gap-3"
                      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {item.issueDate && (
                          <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                            {item.issueDate}
                          </span>
                        )}
                        {item.badgeImage && <img src={item.badgeImage} alt="" className="w-8 h-8 rounded object-cover" />}
                      </div>
                      <h3 className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                        {item.issuer}
                      </p>
                      {item.credentialUrl && (
                        <a
                          href={item.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs no-underline mt-1"
                          style={{ color: "var(--accent)", textDecoration: "none" }}
                        >
                          View credential <OpenInNewIcon sx={{ fontSize: 13 }} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "Skills" && (
              skills.length === 0 ? (
                <PublicEmpty icon="🛠️" title="No skills listed yet" />
              ) : (
                <div className="flex flex-col gap-6">
                  {skills.map((cat) => (
                    <div key={cat._id}>
                      <p className="font-mono text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--accent)" }}>
                        {cat.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(cat.items ?? []).map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-1.5 rounded-full font-mono text-xs font-medium"
                            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "Languages" && (
              languages.length === 0 ? (
                <PublicEmpty icon="🌐" title="No languages listed yet" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {languages.map((lang) => (
                    <div
                      key={lang._id}
                      className="rounded-xl p-5 flex items-center justify-between"
                      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                      <span className="font-mono text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                        {lang.name}
                      </span>
                      <span
                        className="font-mono text-xs px-3 py-1 rounded-full capitalize"
                        style={{ backgroundColor: "rgba(0,255,136,0.1)", color: "var(--accent)" }}
                      >
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "Interests" && (
              interests.length === 0 ? (
                <PublicEmpty icon="✨" title="No interests listed yet" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest._id}
                      className="px-4 py-1.5 rounded-full font-mono text-xs font-medium"
                      style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              )
            )}

            {!isLoading && activeTab === "About me" && (
              <div className="flex flex-col gap-8">
                {resume?.aboutMe?.summary ? (
                  <div
                    className="font-mono text-sm leading-relaxed max-w-2xl"
                    style={{ color: "var(--text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: resume.aboutMe.summary }}
                  />
                ) : (
                  <PublicEmpty icon="📝" title="No summary added yet" />
                )}

                {profile && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-2xl">
                    {[
                      ["Name", profile.name],
                      ["Email", profile.email],
                      ["Phone", profile.phone],
                      ["Location", profile.location],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div key={label} className="flex items-baseline gap-3">
                          <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                            {label}
                          </span>
                          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
