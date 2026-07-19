import { useState, useRef } from "react";

export default function TagInput({
  id,
  label,
  placeholder,
  items,
  onChange,
  maxItems = 30,
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v) || items.length >= maxItems) return;
    onChange([...items, v]);
    setDraft("");
    inputRef.current?.focus();
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && !draft && items.length > 0)
      remove(items.length - 1);
  };

  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
      </label>
      {items.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {items.map((item, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 100,
                background: "hsla(45,100%,72%,0.10)",
                border: "1px solid hsla(45,100%,72%,0.20)",
                color: "var(--orange-yellow-crayola)",
                fontSize: 12,
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label={`Remove ${item}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--a-danger)",
                  padding: "0 2px",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={items.length >= maxItems}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          type="button"
          className="btn btn--ghost"
          onClick={add}
          disabled={!draft.trim() || items.length >= maxItems}
          style={{ flexShrink: 0 }}
        >
          + Add
        </button>
      </div>
      <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 4 }}>
        Press Enter or click Add. {items.length}/{maxItems} added.
      </p>
    </div>
  );
}
