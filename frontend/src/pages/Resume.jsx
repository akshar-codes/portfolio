import { useState, useEffect } from "react";
import { IoBookOutline } from "react-icons/io5";
import api from "../services/api";

/* ------------------------------------------------------------------ *
 * Loading skeleton — mirrors the real content structure so there's
 * no jarring layout shift when data arrives.
 * ------------------------------------------------------------------ */
function ResumeSkeleton() {
  return (
    <article className="resume active">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {[1, 2].map((n) => (
        <section key={n} className="timeline" style={{ marginBottom: 30 }}>
          <div className="title-wrapper">
            <div className="icon-box">
              <IoBookOutline />
            </div>
            <div
              style={{
                height: 20,
                width: 160,
                background: "var(--jet)",
                borderRadius: 6,
                animation: "a-shimmer 1.5s ease-in-out infinite",
              }}
            />
          </div>

          <ol className="timeline-list">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="timeline-item"
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    height: 16,
                    width: "60%",
                    background: "var(--jet)",
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 13,
                    width: "30%",
                    background: "var(--jet)",
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 13,
                    width: "90%",
                    background: "var(--jet)",
                    borderRadius: 4,
                  }}
                />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */
export default function Resume() {
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      try {
        const { data } = await api.get("/resume");
        if (!cancelled) {
          setResume(data);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || "Failed to load resume data.");
          setStatus("error");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Loading state ──────────────────────────────────────────── */
  if (status === "loading") return <ResumeSkeleton />;

  /* ── Error state ────────────────────────────────────────────── */
  if (status === "error") {
    return (
      <article className="resume active">
        <header>
          <h2 className="h2 article-title">Resume</h2>
        </header>
        <p
          style={{
            color: "var(--bittersweet-shimmer)",
            fontSize: "var(--fs-6)",
            marginTop: 20,
          }}
        >
          Could not load resume data: {errorMsg}
        </p>
      </article>
    );
  }

  /* ── Empty state ────────────────────────────────────────────── */
  const hasEducation = resume?.education?.length > 0;
  const hasSkills = resume?.skills?.length > 0;

  if (!hasEducation && !hasSkills) {
    return (
      <article className="resume active">
        <header>
          <h2 className="h2 article-title">Resume</h2>
        </header>
        <p
          style={{
            color: "var(--light-gray)",
            fontSize: "var(--fs-6)",
            marginTop: 20,
          }}
        >
          Resume content coming soon.
        </p>
      </article>
    );
  }

  /* ── Ready state ────────────────────────────────────────────── */
  return (
    <article className="resume active">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {/* ── Education ─────────────────────────────────────────── */}
      {hasEducation && (
        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <IoBookOutline />
            </div>
            <h3 className="h3">Education</h3>
          </div>

          <ol className="timeline-list">
            {resume.education.map((entry) => (
              <li key={entry._id} className="timeline-item">
                <h4 className="h4 timeline-item-title">{entry.institution}</h4>
                <span>{entry.duration}</span>
                <p className="timeline-text">{entry.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Technical Skills ──────────────────────────────────── */}
      {hasSkills && (
        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <IoBookOutline />
            </div>
            <h3 className="h3">Technical Skills</h3>
          </div>

          <ol className="timeline-list">
            {resume.skills.map((group) => (
              <li key={group._id} className="timeline-item">
                <h4 className="h4 timeline-item-title">{group.category}</h4>
                <p className="timeline-text">{group.items.join(", ")}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
