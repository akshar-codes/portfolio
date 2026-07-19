import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Code as CodeIcon,
  YouTube as YouTubeIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const SOCIAL_LINKS = [
  { icon: GitHubIcon, href: "https://github.com/AksharGupta", label: "GitHub" },
  {
    icon: LinkedInIcon,
    href: "https://linkedin.com/in/Akshar",
    label: "LinkedIn",
  },
  { icon: CodeIcon, href: "#", label: "LeetCode" },
  { icon: YouTubeIcon, href: "#", label: "YouTube" },
];

const STATS = [
  { value: 3, label: "Years of\nexperience" },
  { value: 6, label: "Technologies\nmastered" },
  { value: 135, label: "Code\ncommits" },
  { value: 400, label: "DSA questions\nsolved" },
];

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);

  return count;
}

function StatItem({ value, label, started }) {
  const count = useCountUp(value, 1600, started);
  const lines = label.split("\n");

  return (
    <div className="flex items-center gap-3">
      <span className="stat-number">{count}</span>
      <span
        className="text-sm leading-tight"
        style={{ color: "var(--text-secondary)" }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

const TYPING_STRINGS = ["Akshar Gupta", "Full Stack Dev", "ML Engineer"];

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const statsRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const current = TYPING_STRINGS[stringIndex];
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
      setStringIndex((i) => (i + 1) % TYPING_STRINGS.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, stringIndex]);

  // Intersection observer for stats counter
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
  }, []);

  return (
    // Fixed viewport height (minus the 80px navbar) on md+ so the hero and
    // stats row always fit in a single screen, matching the reference design
    // (no page scroll). Below md, height reverts to auto so content can
    // reflow/scroll naturally on small screens instead of being clipped.
    //
    // The hero + stats are wrapped together and vertically centered as ONE
    // block (justify-center), with a fixed gap-16 between them. That keeps
    // the hero anchored close to the navbar and the hero-to-stats spacing
    // constant regardless of viewport height — any extra vertical space
    // splits evenly above/below the whole block instead of collecting as
    // one oversized gap between the hero and the stats row.
    <div className="page-enter md:h-[calc(100vh-80px)] md:overflow-hidden">
      <section className="section-container h-auto md:h-full flex flex-col justify-center py-8">
        <div className="flex flex-col gap-16">
          {/* Hero content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 max-w-xl">
              <p
                className="font-mono text-sm tracking-widest mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Software Developer
              </p>

              <h1
                className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Hello I'm
              </h1>

              <h2
                className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: "var(--accent)", minHeight: "1.2em" }}
              >
                {typedText}
                <span
                  className="inline-block w-0.5 h-10 ml-1 align-middle"
                  style={{
                    backgroundColor: "var(--accent)",
                    animation: "blink 1s step-end infinite",
                  }}
                />
              </h2>

              <p
                className="font-mono text-sm leading-relaxed mb-8 max-w-md"
                style={{ color: "var(--text-secondary)" }}
              >
                I excel at designing sophisticated machine learning solutions
                and I am proficient in various programming languages and DSA.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <a
                  href="/cv.pdf"
                  download
                  className="no-underline"
                  style={{ textDecoration: "none" }}
                >
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm font-semibold border-2 cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: "var(--text-primary)",
                      color: "var(--text-primary)",
                      backgroundColor: "transparent",
                      letterSpacing: "0.1em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--text-primary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    DOWNLOAD CV
                    <DownloadIcon fontSize="small" />
                  </button>
                </a>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 no-underline"
                      style={{
                        borderColor: "var(--accent)",
                        color: "var(--accent)",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent)";
                        e.currentTarget.style.color = "#1c1c1e";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Profile Image */}
            <div className="relative flex-shrink-0">
              {/* Decorative corner ticks */}
              <span
                className="absolute -top-4 left-4 font-mono text-lg font-bold"
                style={{ color: "var(--accent)" }}
              >
                —
              </span>
              <span
                className="absolute -top-6 right-2 font-mono text-lg font-bold"
                style={{ color: "var(--accent)", transform: "rotate(45deg)" }}
              >
                /
              </span>
              <span
                className="absolute top-1/2 -left-6 font-mono text-lg font-bold"
                style={{ color: "var(--accent)" }}
              >
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

              {/* Animated rotating dashed border wrapper */}
              <div className="profile-frame relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                {/* Rotating dashed border ring (SVG) */}
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

                {/* Clipped circular profile image */}
                <div
                  className="absolute inset-3 rounded-full overflow-hidden"
                  style={{
                    border: "2px solid var(--border)",
                  }}
                >
                  <div
                    className="w-full h-full flex items-end justify-center"
                    style={{
                      background:
                        "linear-gradient(160deg, #2a2a2d 0%, #1c1c1e 60%, #252527 100%)",
                    }}
                  >
                    <img
                      src="/profile.jpg"
                      alt="Akshar Gupta"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Fallback initials */}
                    <span
                      className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-bold"
                      style={{ color: "var(--accent)", opacity: 0.15 }}
                    >
                      AG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {STATS.map((stat) => (
              <StatItem
                key={stat.label}
                value={stat.value}
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
