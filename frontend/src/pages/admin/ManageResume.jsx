import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { moveItem, stripTempIds, isOrderDirty } from "../../utils/ordering";
import ReorderButtons from "../../components/common/ReorderButtons";
import SectionCard from "../../components/common/SectionCard";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../../components/common/AdminStatus";

/* ================================================================== *
 * Helpers
 * ================================================================== */

function newEducationEntry() {
  return {
    _tempId: crypto.randomUUID(),
    institution: "",
    duration: "",
    description: "",
  };
}

function newSkillGroup(order = 0) {
  return { _tempId: crypto.randomUUID(), category: "", items: [], order };
}

/* ================================================================== *
 * EducationEditor
 * ================================================================== */
function EducationEditor({ entry, onSave, onCancel }) {
  const [form, setForm] = useState({
    institution: entry.institution,
    duration: entry.duration,
    description: entry.description,
  });
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <input
        ref={firstRef}
        className="form-input"
        placeholder="Institution"
        value={form.institution}
        onChange={set("institution")}
        style={{ fontSize: 13 }}
      />
      <input
        className="form-input"
        placeholder="Duration (e.g. 2025 — 2029)"
        value={form.duration}
        onChange={set("duration")}
        style={{ fontSize: 13 }}
      />
      <textarea
        className="form-input"
        placeholder="Description"
        value={form.description}
        onChange={set("description")}
        style={{ fontSize: 13, minHeight: 80, resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn--primary"
          onClick={() => onSave(form)}
          disabled={
            !form.institution.trim() ||
            !form.duration.trim() ||
            !form.description.trim()
          }
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
 * SkillGroupEditor
 * ================================================================== */
function SkillGroupEditor({ group, onSave, onCancel }) {
  const [category, setCategory] = useState(group.category);
  const [items, setItems] = useState([...group.items]);
  const [newItem, setNewItem] = useState("");
  const firstRef = useRef(null);
  const newItemRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    setItems((p) => [...p, trimmed]);
    setNewItem("");
    newItemRef.current?.focus();
  };

  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <input
        ref={firstRef}
        className="form-input"
        placeholder="Category name (e.g. Frontend)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ fontSize: 13 }}
      />

      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
                color: "var(--a-accent)",
                fontSize: 12,
              }}
            >
              {item}
              <button
                onClick={() => removeItem(idx)}
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
          ref={newItemRef}
          className="form-input"
          placeholder="Add skill (press Enter)"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ fontSize: 13, flex: 1 }}
        />
        <button
          className="btn btn--ghost"
          onClick={addItem}
          disabled={!newItem.trim()}
          style={{ flexShrink: 0 }}
        >
          + Add
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn--primary"
          onClick={() => onSave({ category, items })}
          disabled={!category.trim()}
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
 * Main ManageResume component
 * ================================================================== */
export default function ManageResume() {
  const [resume, setResume] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [fetchError, setFetchError] = useState("");

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(null);

  // Server-confirmed skill order for dirty-check
  const [serverSkills, setServerSkills] = useState(null);

  /* ── Fetch ──────────────────────────────────────────────────── */
  const loadResume = useCallback(async () => {
    setFetchStatus("loading");
    setFetchError("");
    try {
      const { data } = await api.get(API_ENDPOINTS.adminResume);
      const sortedSkills = [...(data.skills ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({ ...s, _tempId: s._id }));

      setResume({
        ...data,
        education: (data.education ?? []).map((e) => ({
          ...e,
          _tempId: e._id,
        })),
        skills: sortedSkills,
      });
      setServerSkills(sortedSkills);
      setFetchStatus("ready");
    } catch (err) {
      setFetchError(err.message);
      setFetchStatus("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => loadResume());
  }, [loadResume]);

  /* ── PATCH helper ───────────────────────────────────────────── */
  const patchSection = useCallback(
    async (section, newArray, { successMsg } = {}) => {
      setSaving(section);
      try {
        const { data } = await api.patch(API_ENDPOINTS.adminResume, {
          section,
          value: stripTempIds(newArray),
        });
        const refreshedSkills =
          section === "skills"
            ? [...(data.skills ?? [])]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item) => ({ ...item, _tempId: item._id }))
            : null;

        setResume((prev) => ({
          ...prev,
          ...data,
          [section]:
            section === "skills"
              ? refreshedSkills
              : (data[section] ?? []).map((item) => ({
                  ...item,
                  _tempId: item._id,
                })),
        }));

        if (section === "skills" && refreshedSkills) {
          setServerSkills(refreshedSkills);
        }

        setEditing(null);
        toast.success(
          successMsg ??
            (section === "education"
              ? "Education updated."
              : "Skills updated."),
        );
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSaving(null);
      }
    },
    [],
  );

  /* ── Education handlers ─────────────────────────────────────── */
  const saveEducationEntry = (tempId) => (formData) => {
    const updated = resume.education.map((e) =>
      e._tempId === tempId ? { ...e, ...formData } : e,
    );
    patchSection("education", updated);
  };

  const deleteEducationEntry = (tempId) => {
    if (!window.confirm("Delete this education entry?")) return;
    const updated = resume.education.filter((e) => e._tempId !== tempId);
    patchSection("education", updated);
  };

  const addEducationEntry = () => {
    const entry = newEducationEntry();
    const updated = [...resume.education, entry];
    setResume((p) => ({ ...p, education: updated }));
    setEditing({ section: "education", id: entry._tempId });
  };

  const cancelEducationEdit = (tempId) => {
    const item = resume.education.find((e) => e._tempId === tempId);
    if (item && !item._id) {
      setResume((p) => ({
        ...p,
        education: p.education.filter((e) => e._tempId !== tempId),
      }));
    }
    setEditing(null);
  };

  /* ── Skills handlers ────────────────────────────────────────── */
  const saveSkillGroup = (tempId) => (formData) => {
    const updated = resume.skills.map((s) =>
      s._tempId === tempId ? { ...s, ...formData } : s,
    );
    patchSection("skills", updated);
  };

  const deleteSkillGroup = (tempId) => {
    if (!window.confirm("Delete this skill category?")) return;
    const updated = resume.skills
      .filter((s) => s._tempId !== tempId)
      .map((s, i) => ({ ...s, order: i }));
    patchSection("skills", updated);
  };

  const addSkillGroup = () => {
    const group = newSkillGroup(resume.skills.length);
    const updated = [...resume.skills, group];
    setResume((p) => ({ ...p, skills: updated }));
    setEditing({ section: "skills", id: group._tempId });
  };

  const cancelSkillEdit = (tempId) => {
    const item = resume.skills.find((s) => s._tempId === tempId);
    if (item && !item._id) {
      setResume((p) => ({
        ...p,
        skills: p.skills.filter((s) => s._tempId !== tempId),
      }));
    }
    setEditing(null);
  };

  /* ── Skill reorder ──────────────────────────────────────────── */
  const handleMoveSkill = (index, direction) => {
    setResume((prev) => ({
      ...prev,
      skills: moveItem(prev.skills, index, direction),
    }));
  };

  const handleSaveSkillOrder = () => {
    patchSection("skills", resume.skills, { successMsg: "Skill order saved." });
  };

  // Dirty: compare local ID sequence against last server-confirmed sequence
  const skillOrderDirty =
    saving !== "skills" &&
    !editing &&
    resume !== null &&
    isOrderDirty(resume.skills, serverSkills);

  /* ── Render guards ──────────────────────────────────────────── */
  if (fetchStatus === "loading")
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Resume</h2>
        </div>
        <AdminSkeleton rows={4} />
      </div>
    );

  if (fetchStatus === "error")
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Resume</h2>
        </div>
        <AdminError message={fetchError} onRetry={loadResume} />
      </div>
    );

  const isEditingSection = (section, id) =>
    editing?.section === section && editing?.id === id;

  /* ── Main render ────────────────────────────────────────────── */
  return (
    <div className="admin-page">
      {/* ════════════════════════════════════════════════════════
          EDUCATION
      ════════════════════════════════════════════════════════ */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Education</h2>
        <button
          className="btn btn--primary"
          onClick={addEducationEntry}
          disabled={saving === "education"}
        >
          + Add Entry
        </button>
      </div>

      {resume.education.length === 0 ? (
        <AdminEmpty
          icon="🎓"
          title="No education entries yet"
          sub="Click Add Entry above to add your first one."
        />
      ) : (
        <ul className="admin-list" aria-label="Education entries">
          {resume.education.map((entry) => {
            const isEditing = isEditingSection("education", entry._tempId);

            return (
              <SectionCard key={entry._tempId}>
                <div className="admin-item__body">
                  {isEditing ? (
                    <EducationEditor
                      entry={entry}
                      onSave={saveEducationEntry(entry._tempId)}
                      onCancel={() => cancelEducationEdit(entry._tempId)}
                    />
                  ) : (
                    <>
                      <span className="admin-item__name">
                        {entry.institution || (
                          <em style={{ color: "var(--a-text-d)" }}>Untitled</em>
                        )}
                      </span>
                      <div className="admin-item__meta">
                        <span
                          style={{ fontSize: 12, color: "var(--a-text-m)" }}
                        >
                          {entry.duration}
                        </span>
                      </div>
                      <span
                        className="admin-item__preview"
                        style={{ whiteSpace: "normal", lineHeight: 1.5 }}
                      >
                        {entry.description}
                      </span>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="admin-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={() =>
                        setEditing({ section: "education", id: entry._tempId })
                      }
                      disabled={!!saving || !!editing}
                      aria-label={`Edit ${entry.institution}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => deleteEducationEntry(entry._tempId)}
                      disabled={!!saving}
                      aria-label={`Delete ${entry.institution}`}
                    >
                      {saving === "education" ? "…" : "Delete"}
                    </button>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </ul>
      )}

      {/* ════════════════════════════════════════════════════════
          TECHNICAL SKILLS
      ════════════════════════════════════════════════════════ */}
      <div className="admin-page__header" style={{ marginTop: 8 }}>
        <h2 className="admin-page__title">Technical Skills</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {skillOrderDirty && (
            <button
              className="btn btn--ghost"
              onClick={handleSaveSkillOrder}
              disabled={!!saving}
            >
              Save Order
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={addSkillGroup}
            disabled={saving === "skills"}
          >
            + Add Category
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -8 }}>
        Use ↑ ↓ to reorder skill categories, then click{" "}
        <strong>Save Order</strong>.
      </p>

      {resume.skills.length === 0 ? (
        <AdminEmpty
          icon="⚙️"
          title="No skill categories yet"
          sub="Click Add Category to create your first skill group."
        />
      ) : (
        <ul className="admin-list" aria-label="Skill categories">
          {resume.skills.map((group, index) => {
            const isEditing = isEditingSection("skills", group._tempId);

            return (
              <SectionCard key={group._tempId}>
                {!isEditing && (
                  <ReorderButtons
                    index={index}
                    total={resume.skills.length}
                    onMove={handleMoveSkill}
                    disabled={!!editing || !!saving}
                  />
                )}

                <div className="admin-item__body">
                  {isEditing ? (
                    <SkillGroupEditor
                      group={group}
                      onSave={saveSkillGroup(group._tempId)}
                      onCancel={() => cancelSkillEdit(group._tempId)}
                    />
                  ) : (
                    <>
                      <span className="admin-item__name">
                        {group.category || (
                          <em style={{ color: "var(--a-text-d)" }}>Untitled</em>
                        )}
                      </span>
                      <div
                        className="admin-item__meta"
                        style={{
                          flexWrap: "wrap",
                          gap: "5px 6px",
                          marginTop: 6,
                        }}
                      >
                        {group.items.map((item, idx) => (
                          <span key={idx} className="admin-item__badge">
                            {item}
                          </span>
                        ))}
                        {group.items.length === 0 && (
                          <span
                            style={{ fontSize: 12, color: "var(--a-text-d)" }}
                          >
                            No skills added yet
                          </span>
                        )}
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
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="admin-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={() =>
                        setEditing({ section: "skills", id: group._tempId })
                      }
                      disabled={!!saving || !!editing}
                      aria-label={`Edit ${group.category}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => deleteSkillGroup(group._tempId)}
                      disabled={!!saving}
                      aria-label={`Delete ${group.category}`}
                    >
                      {saving === "skills" ? "…" : "Delete"}
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
