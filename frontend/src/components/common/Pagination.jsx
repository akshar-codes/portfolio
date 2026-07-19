export default function Pagination({
  page,
  totalPages,
  onChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn--ghost"
        onClick={() => onChange(page - 1)}
        disabled={page === 1 || disabled}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 13, color: "var(--a-text-muted)" }}>
        {page} / {totalPages}
      </span>
      <button
        className="btn btn--ghost"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages || disabled}
      >
        Next →
      </button>
    </div>
  );
}
