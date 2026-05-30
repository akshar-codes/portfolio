import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAdminAbout, useUpdateAbout } from "../hooks/useAbout";
import { ABOUT_ICON_OPTIONS, resolveAboutIcon } from "../utils/aboutIconMap";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

/* ================================================================== *
 * Tiny helpers
 * ================================================================== */

function newParagraph(order = 0) {
  return { _tempId: crypto.randomUUID(), text: "", order };
}

function newService(order = 0) {
  return {
    _tempId: crypto.randomUUID(),
    title: "",
    description: "",
    icon: "web",
    order,
  };
}

/** Move array item at index by +1 or -1, then re-number order fields. */
function moveItem(arr, index, direction) {
  const next = index + direction;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy.map((item, i) => ({ ...item, order: i }));
}

/** Strips _tempId before sending to the API. */
function stripTempIds(arr) {
  return arr.map(({ _tempId, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

/* ================================================================== *
 * ParagraphEditor — inline editor for a single paragraph
 * ================================================================== */
function ParagraphEditor({ paragraph, onSave, onCancel }) {
  const [text, setText] = useState(paragraph.text);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isValid = text.trim().length >= 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <textarea
        ref={textareaRef}
        className="form-input"
        placeholder="Write a paragraph about yourself… (min 10 characters)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        style={{ minHeight: 100, resize: "vertical", fontSize: 13 }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: text.length > 950 ? "var(--a-danger)" : "var(--a-text-dim)",
          }}
        >
          {text.length} / 1000
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn--primary"
            onClick={() => onSave({ text: text.trim() })}
            disabled={!isValid}
          >
            Save
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * IconPicker — visual grid of icon options
 * ================================================================== */
function IconPicker({ value, onChange }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--a-text-m)",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          marginBottom: 8,
        }}
      >
        Icon
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ABOUT_ICON_OPTIONS.map((opt) => {
          const isSelected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              title={opt.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 12px",
                borderRadius: "var(--a-r-sm)",
                border: isSelected
                  ? "1px solid hsla(45,100%,72%,0.6)"
                  : "1px solid var(--a-border)",
                background: isSelected
                  ? "hsla(45,100%,72%,0.12)"
                  : "var(--a-surface)",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                minWidth: 72,
              }}
            >
              <img
                src={opt.src}
                alt={opt.label}
                width={28}
                height={28}
                style={{ objectFit: "contain" }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: isSelected ? "var(--a-accent)" : "var(--a-text-m)",
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: 64,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== *
 * ServiceEditor — inline editor for a single service card
 * ================================================================== */
function ServiceEditor({ service, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: service.title,
    description: service.description,
    icon: service.icon || "web",
  });
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const isValid =
    form.title.trim().length >= 2 && form.description.trim().length >= 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="admin-form__field">
          <label className="admin-form__label">
            Title <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            ref={firstRef}
            className="form-input"
            placeholder="e.g. Full-Stack Web Development"
            value={form.title}
            onChange={set("title")}
            maxLength={100}
            style={{ fontSize: 13 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {/* Spacer — keeps the grid balanced on larger screens */}
        </div>
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">
          Description <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <textarea
          className="form-input"
          placeholder="Brief description of this service…"
          value={form.description}
          onChange={set("description")}
          maxLength={500}
          style={{ minHeight: 80, resize: "vertical", fontSize: 13 }}
        />
        <span
          style={{
            fontSize: 11,
            color:
              form.description.length > 470
                ? "var(--a-danger)"
                : "var(--a-text-dim)",
            marginTop: 4,
          }}
        >
          {form.description.length} / 500
        </span>
      </div>

      <IconPicker
        value={form.icon}
        onChange={(key) => setForm((p) => ({ ...p, icon: key }))}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          className="btn btn--primary"
          onClick={() => onSave(form)}
          disabled={!isValid}
        >
          Save
        </button>
        <button className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ================================================================== *
 * SectionCard — consistent list item wrapper
 * ================================================================== */
function SectionCard({ children }) {
  return (
    <li
      className="admin-item"
      style={{ alignItems: "flex-start", padding: "16px 18px" }}
    >
      {children}
    </li>
  );
}

/* ================================================================== *
 * ReorderButtons — shared ↑/↓ controls
 * ================================================================== */
function ReorderButtons({ index, total, onMove, disabled }) {
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

/* ================================================================== *
 * Main ManageAbout component
 * ================================================================== */
export default function ManageAbout() {
  const { data: about, isLoading, isError, error } = useAdminAbout();
  const { mutateAsync: updateAbout } = useUpdateAbout();

  // Which item is currently open in an inline editor
  // { section: "paragraphs"|"services", id: string }
  const [editing, setEditing] = useState(null);

  // Which section is currently saving (for per-section spinner)
  const [saving, setSaving] = useState(null); // "paragraphs"|"services"|null

  // Local copies for optimistic reorder / add / cancel
  const [localParagraphs, setLocalParagraphs] = useState(null);
  const [localServices, setLocalServices] = useState(null);

  // Seed local state from server data when it first arrives
  useEffect(() => {
    if (about && localParagraphs === null) {
      setLocalParagraphs(
        (about.paragraphs ?? []).map((p) => ({ ...p, _tempId: p._id })),
      );
    }
    if (about && localServices === null) {
      setLocalServices(
        (about.services ?? []).map((s) => ({ ...s, _tempId: s._id })),
      );
    }
  }, [about]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── PATCH helper ───────────────────────────────────────────── */
  const patchSection = useCallback(
    async (section, newArray) => {
      setSaving(section);
      try {
        const updated = await updateAbout({
          section,
          value: stripTempIds(newArray),
        });
        // Merge fresh server data back, preserving _tempIds
        const refreshed = (updated[section] ?? []).map((item) => ({
          ...item,
          _tempId: item._id,
        }));
        if (section === "paragraphs") setLocalParagraphs(refreshed);
        else setLocalServices(refreshed);
        setEditing(null);
        toast.success(
          `${section === "paragraphs" ? "Paragraphs" : "Service cards"} updated.`,
        );
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSaving(null);
      }
    },
    [updateAbout],
  );

  /* ── Paragraph handlers ─────────────────────────────────────── */

  const saveParagraph = (tempId) => (formData) => {
    const updated = localParagraphs.map((p) =>
      p._tempId === tempId ? { ...p, ...formData } : p,
    );
    patchSection("paragraphs", updated);
  };

  const deleteParagraph = (tempId) => {
    if (!window.confirm("Delete this paragraph?")) return;
    const updated = localParagraphs.filter((p) => p._tempId !== tempId);
    patchSection("paragraphs", updated);
  };

  const moveParagraph = (index, direction) => {
    setLocalParagraphs((prev) => moveItem(prev, index, direction));
  };

  const saveParagraphOrder = () => {
    patchSection("paragraphs", localParagraphs);
  };

  const addParagraph = () => {
    const entry = newParagraph(localParagraphs.length);
    setLocalParagraphs((prev) => [...prev, entry]);
    setEditing({ section: "paragraphs", id: entry._tempId });
  };

  const cancelParagraphEdit = (tempId) => {
    const item = localParagraphs.find((p) => p._tempId === tempId);
    if (item && !item._id) {
      setLocalParagraphs((prev) => prev.filter((p) => p._tempId !== tempId));
    }
    setEditing(null);
  };

  /* ── Service handlers ───────────────────────────────────────── */

  const saveService = (tempId) => (formData) => {
    const updated = localServices.map((s) =>
      s._tempId === tempId ? { ...s, ...formData } : s,
    );
    patchSection("services", updated);
  };

  const deleteService = (tempId) => {
    if (!window.confirm("Delete this service card?")) return;
    const updated = localServices.filter((s) => s._tempId !== tempId);
    patchSection("services", updated);
  };

  const moveService = (index, direction) => {
    setLocalServices((prev) => moveItem(prev, index, direction));
  };

  const saveServiceOrder = () => {
    patchSection("services", localServices);
  };

  const addService = () => {
    const entry = newService(localServices.length);
    setLocalServices((prev) => [...prev, entry]);
    setEditing({ section: "services", id: entry._tempId });
  };

  const cancelServiceEdit = (tempId) => {
    const item = localServices.find((s) => s._tempId === tempId);
    if (item && !item._id) {
      setLocalServices((prev) => prev.filter((s) => s._tempId !== tempId));
    }
    setEditing(null);
  };

  /* ── Render guards ──────────────────────────────────────────── */
  if (isLoading || localParagraphs === null || localServices === null) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">About</h2>
        </div>
        <AdminSkeleton rows={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">About</h2>
        </div>
        <AdminError message={error?.message} />
      </div>
    );
  }

  const isEditing = (section, id) =>
    editing?.section === section && editing?.id === id;

  /* ── Reorder dirty-check: show "Save order" button when local
       state differs from last server order ────────────────────── */
  const paragraphOrderDirty =
    saving !== "paragraphs" &&
    !editing &&
    localParagraphs.some((p, i) => p.order !== i);

  const serviceOrderDirty =
    saving !== "services" &&
    !editing &&
    localServices.some((s, i) => s.order !== i);

  /* ── Main render ────────────────────────────────────────────── */
  return (
    <div className="admin-page">
      {/* ════════════════════════════════════════════════════════
          PARAGRAPHS
      ════════════════════════════════════════════════════════ */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">About Paragraphs</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {paragraphOrderDirty && (
            <button
              className="btn btn--ghost"
              onClick={saveParagraphOrder}
              disabled={!!saving}
            >
              Save Order
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={addParagraph}
            disabled={!!editing || !!saving}
          >
            + Add Paragraph
          </button>
        </div>
      </div>

      {/* Helper note */}
      <p style={{ fontSize: 12, color: "var(--a-text-dim)", marginTop: -8 }}>
        These paragraphs appear in the About Me section. Use ↑ ↓ to reorder,
        then click Save Order.
      </p>

      {localParagraphs.length === 0 ? (
        <AdminEmpty
          icon="📝"
          title="No paragraphs yet"
          sub="Click Add Paragraph above to write about yourself."
        />
      ) : (
        <ul className="admin-list" aria-label="About paragraphs">
          {localParagraphs.map((para, index) => {
            const isEditingThis = isEditing("paragraphs", para._tempId);

            return (
              <SectionCard key={para._tempId}>
                {/* Reorder arrows — hidden while editing */}
                {!isEditingThis && (
                  <ReorderButtons
                    index={index}
                    total={localParagraphs.length}
                    onMove={moveParagraph}
                    disabled={!!editing || !!saving}
                  />
                )}

                <div className="admin-item__body">
                  {isEditingThis ? (
                    <ParagraphEditor
                      paragraph={para}
                      onSave={saveParagraph(para._tempId)}
                      onCancel={() => cancelParagraphEdit(para._tempId)}
                    />
                  ) : (
                    <>
                      {/* Order badge */}
                      <div
                        className="admin-item__meta"
                        style={{ marginBottom: 6 }}
                      >
                        <span
                          className="admin-item__badge"
                          style={{
                            background: "transparent",
                            color: "var(--a-text-dim)",
                            borderColor: "var(--a-border)",
                            fontSize: 10,
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>

                      {/* Paragraph text preview */}
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--a-text)",
                          lineHeight: 1.6,
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {para.text || (
                          <em style={{ color: "var(--a-text-d)" }}>
                            Empty paragraph
                          </em>
                        )}
                      </p>
                    </>
                  )}
                </div>

                {!isEditingThis && (
                  <div className="admin-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={() =>
                        setEditing({
                          section: "paragraphs",
                          id: para._tempId,
                        })
                      }
                      disabled={!!editing || !!saving}
                      aria-label="Edit paragraph"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => deleteParagraph(para._tempId)}
                      disabled={!!saving}
                      aria-label="Delete paragraph"
                    >
                      {saving === "paragraphs" ? "…" : "Delete"}
                    </button>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </ul>
      )}

      {/* ════════════════════════════════════════════════════════
          SERVICE CARDS
      ════════════════════════════════════════════════════════ */}
      <div className="admin-page__header" style={{ marginTop: 8 }}>
        <h2 className="admin-page__title">Service Cards</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {serviceOrderDirty && (
            <button
              className="btn btn--ghost"
              onClick={saveServiceOrder}
              disabled={!!saving}
            >
              Save Order
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={addService}
            disabled={!!editing || !!saving}
          >
            + Add Service
          </button>
        </div>
      </div>

      {/* Helper note */}
      <p style={{ fontSize: 12, color: "var(--a-text-dim)", marginTop: -8 }}>
        These cards appear in the "What I'm Doing" section. Use ↑ ↓ to reorder,
        then click Save Order.
      </p>

      {localServices.length === 0 ? (
        <AdminEmpty
          icon="⚙️"
          title="No service cards yet"
          sub="Click Add Service above to add your first one."
        />
      ) : (
        <ul className="admin-list" aria-label="Service cards">
          {localServices.map((service, index) => {
            const isEditingThis = isEditing("services", service._tempId);

            return (
              <SectionCard key={service._tempId}>
                {/* Reorder arrows */}
                {!isEditingThis && (
                  <ReorderButtons
                    index={index}
                    total={localServices.length}
                    onMove={moveService}
                    disabled={!!editing || !!saving}
                  />
                )}

                {/* Icon thumbnail */}
                {!isEditingThis && (
                  <img
                    src={resolveAboutIcon(service.icon)}
                    alt={service.title}
                    width={36}
                    height={36}
                    style={{
                      objectFit: "contain",
                      flexShrink: 0,
                      opacity: 0.85,
                    }}
                  />
                )}

                <div className="admin-item__body">
                  {isEditingThis ? (
                    <ServiceEditor
                      service={service}
                      onSave={saveService(service._tempId)}
                      onCancel={() => cancelServiceEdit(service._tempId)}
                    />
                  ) : (
                    <>
                      <span className="admin-item__name">
                        {service.title || (
                          <em style={{ color: "var(--a-text-d)" }}>Untitled</em>
                        )}
                      </span>
                      <div className="admin-item__meta">
                        <code
                          style={{
                            fontSize: 11,
                            color: "var(--a-text-dim)",
                            background: "var(--a-surface-3)",
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontFamily: "monospace",
                          }}
                        >
                          {service.icon}
                        </code>
                        <span style={{ color: "var(--a-text-dim)" }}>·</span>
                        <span
                          style={{ fontSize: 11, color: "var(--a-text-dim)" }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <span className="admin-item__preview">
                        {service.description?.slice(0, 100)}
                        {service.description?.length > 100 && "…"}
                      </span>
                    </>
                  )}
                </div>

                {!isEditingThis && (
                  <div className="admin-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={() =>
                        setEditing({
                          section: "services",
                          id: service._tempId,
                        })
                      }
                      disabled={!!editing || !!saving}
                      aria-label={`Edit ${service.title}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => deleteService(service._tempId)}
                      disabled={!!saving}
                      aria-label={`Delete ${service.title}`}
                    >
                      {saving === "services" ? "…" : "Delete"}
                    </button>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
