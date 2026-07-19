import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Resume", path: "/resume" },
  { label: "Work", path: "/work" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Header — full nav on desktop, logo only on mobile */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid transparent",
        }}
      >
        <nav className="section-container flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-0.5 no-underline"
            style={{ textDecoration: "none" }}
          >
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Akshar
            </span>
            <span
              className="font-mono text-3xl font-black"
              style={{ color: "var(--accent)", lineHeight: 1 }}
            >
              .
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative no-underline text-sm font-medium transition-colors duration-200"
                style={{
                  textDecoration: "none",
                  color: isActive(link.path)
                    ? "var(--accent)"
                    : "var(--text-primary)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link.label}
                {isActive(link.path) && (
                  <span
                    className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </Link>
            ))}

            {/* Hire Me CTA */}
            <Link
              to="/contact"
              className="no-underline"
              style={{ textDecoration: "none" }}
            >
              <button
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border-0"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#1c1c1e",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-dark)";
                  e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Hire me
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch justify-around rounded-t-2xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.35)",
        }}
        aria-label="Primary"
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex-1 flex items-center justify-center py-4 no-underline text-xs font-semibold tracking-tight transition-colors duration-200"
              style={{
                textDecoration: "none",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "Inter, sans-serif",
              }}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
