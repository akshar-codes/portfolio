export function AdminSpinner({ label = "Loading…" }) {
  return (
    <div className="a-status">
      <div className="a-spinner" />
      <p className="a-status__title">{label}</p>
    </div>
  );
}

export function AdminEmpty({
  icon = "📭",
  title = "Nothing here yet",
  sub = "",
}) {
  return (
    <div className="a-status">
      <span className="a-status__icon">{icon}</span>
      <p className="a-status__title">{title}</p>
      {sub && <p className="a-status__sub">{sub}</p>}
    </div>
  );
}

export function AdminError({ message, onRetry }) {
  return (
    <div className="a-status">
      <span className="a-status__icon">⚠️</span>
      <p className="a-status__title">Something went wrong</p>
      {message && <p className="a-status__sub">{message}</p>}
      {onRetry && (
        <button
          className="btn btn--ghost"
          onClick={onRetry}
          style={{ marginTop: 8 }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function AdminSkeleton({ rows = 4 }) {
  return (
    <div className="a-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="a-skeleton__item" />
      ))}
    </div>
  );
}
