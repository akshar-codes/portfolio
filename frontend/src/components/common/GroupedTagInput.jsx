import { useState, useRef } from "react";

export function GroupedTagInput({
  id,
  label,
  groups,
  onChange,
  maxGroups = 10,
}) {
  const [newGroupName, setNewGroupName] = useState("");
  const newGroupRef = useRef(null);

  const addGroup = () => {
    const name = newGroupName.trim();
    if (!name || groups.length >= maxGroups) return;
    onChange([...groups, { group: name, items: [] }]);
    setNewGroupName("");
    newGroupRef.current?.focus();
  };

  const renameGroup = (idx, newName) => {
    const updated = groups.map((g, i) =>
      i === idx ? { ...g, group: newName } : g,
    );
    onChange(updated);
  };

  const deleteGroup = (idx) => {
    onChange(groups.filter((_, i) => i !== idx));
  };

  const addItem = (groupIdx, item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (groups[groupIdx].items.includes(trimmed)) return;
    const updated = groups.map((g, i) =>
      i === groupIdx ? { ...g, items: [...g.items, trimmed] } : g,
    );
    onChange(updated);
  };

  const removeItem = (groupIdx, itemIdx) => {
    const updated = groups.map((g, i) =>
      i === groupIdx
        ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) }
        : g,
    );
    onChange(updated);
  };

  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
      </label>

      {groups.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 12,
          }}
        >
          {groups.map((g, groupIdx) => (
            <GroupRow
              key={groupIdx}
              group={g}
              onRename={(name) => renameGroup(groupIdx, name)}
              onDelete={() => deleteGroup(groupIdx)}
              onAddItem={(item) => addItem(groupIdx, item)}
              onRemoveItem={(itemIdx) => removeItem(groupIdx, itemIdx)}
            />
          ))}
        </div>
      )}

      {groups.length < maxGroups && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={newGroupRef}
            id={id}
            type="text"
            className="form-input"
            placeholder='Add group (e.g. "Frontend", "Backend")'
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGroup();
              }
            }}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={addGroup}
            disabled={!newGroupName.trim()}
            style={{ flexShrink: 0 }}
          >
            + Add Group
          </button>
        </div>
      )}

      <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 6 }}>
        {groups.length}/{maxGroups} groups. Press Enter or click Add Group.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * GroupRow — a single technology group with its items
 * ------------------------------------------------------------------ */
function GroupRow({
  group,
  onRename,
  onDelete,
  onAddItem,
  onRemoveItem,
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const handleAddItem = () => {
    const v = draft.trim();
    if (!v) return;
    onAddItem(v);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        border: "1px solid var(--a-border)",
        borderRadius: "var(--a-r-md)",
        padding: "12px 14px",
        background: "var(--a-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          className="form-input"
          value={group.group}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Group name"
          maxLength={80}
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--a-accent)",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--a-border)",
            borderRadius: 0,
            padding: "4px 0",
          }}
        />
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete group ${group.group}`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--a-danger)",
            fontSize: 16,
            padding: "0 4px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {group.items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {group.items.map((item, itemIdx) => (
            <span
              key={itemIdx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 100,
                fontSize: 12,
                background: "hsla(45,100%,72%,0.10)",
                border: "1px solid hsla(45,100%,72%,0.20)",
                color: "var(--orange-yellow-crayola)",
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemoveItem(itemIdx)}
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
          type="text"
          className="form-input"
          placeholder={`Add item to "${group.group}" (press Enter)`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem();
            }
          }}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleAddItem}
          disabled={!draft.trim()}
          style={{ flexShrink: 0 }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
