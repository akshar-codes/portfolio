/**
 * Public-site error/empty states. Mirrors the intent of
 * components/common/AdminStatus.jsx (AdminError/AdminEmpty) but styled
 * with the public design tokens (public.css) instead of admin.css, so
 * these never look out of place on a public route.
 */

export function PublicError({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-4">
      <span className="text-3xl" aria-hidden="true">
        ⚠️
      </span>
      <p className="font-mono text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      {message && (
        <p className="font-mono text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2 rounded-full font-mono text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
          style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-dark)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function PublicEmpty({ icon = "📭", title = "Nothing here yet", message }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-16 px-4">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-mono text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      {message && (
        <p className="font-mono text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
