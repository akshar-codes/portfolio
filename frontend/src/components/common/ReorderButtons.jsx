export default function ReorderButtons({ index, total, onMove, disabled }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <button
        className="btn btn--ghost"
        onClick={() => onMove(index, -1)}
        disabled={index === 0 || disabled}
        aria-label="Move up"
        style={{ height: 28, padding: "0 10px", fontSize: 12 }}
      >
        ↑
      </button>
      <button
        className="btn btn--ghost"
        onClick={() => onMove(index, 1)}
        disabled={index === total - 1 || disabled}
        aria-label="Move down"
        style={{ height: 28, padding: "0 10px", fontSize: 12 }}
      >
        ↓
      </button>
    </div>
  );
}
