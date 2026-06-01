import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAdminProfile, useUpdateProfile } from "../hooks/useProfile";
import { resolveIcon } from "../utils/iconMap";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../components/AdminStatus";

/* ================================================================== *
 * Helpers — identical to ManageAbout.jsx
 * ================================================================== */

function newLink(order = 0) {
  return { _tempId: crypto.randomUUID(), label: "", url: "", icon: "", order };
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

/** Compare two arrays by _id sequence to detect reordering. */
function isOrderDirty(local, server) {
  if (!local || !server || local.length !== server.length) return false;
  return local.some((item, i) => {
    const serverId = server[i]?._id ?? server[i]?._tempId;
    return item._id !== serverId && item._tempId !== serverId;
  });
}

/* ================================================================== *
 * ReorderButtons — identical to ManageAbout.jsx
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
 * BasicInfoForm — inline editor for the scalar fields
 * ================================================================== */
function BasicInfoForm({ profile, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: profile.name ?? "",
    title: profile.title ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    avatar: profile.avatar ?? "",
  });

  const firstRef = useRef(null);
  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const isValid = form.name.trim() && form.title.trim() && form.email.trim();

  return (
    <div className="admin-form" style={{ maxWidth: "100%" }}>
      <div className="admin-form__row admin-form__row--2col">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="pf-name">
            Name <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            ref={firstRef}
            id="pf-name"
            className="form-input"
            value={form.name}
            onChange={set("name")}
            maxLength={100}
          />
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="pf-title">
            Title / Role <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            id="pf-title"
            className="form-input"
            value={form.title}
            onChange={set("title")}
            maxLength={100}
          />
        </div>
      </div>

      <div className="admin-form__row admin-form__row--2col">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="pf-email">
            Email <span style={{ color: "var(--a-danger)" }}>*</span>
          </label>
          <input
            id="pf-email"
            type="email"
            className="form-input"
            value={form.email}
            onChange={set("email")}
            maxLength={254}
          />
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="pf-phone">
            Phone
          </label>
          <input
            id="pf-phone"
            className="form-input"
            value={form.phone}
            onChange={set("phone")}
            maxLength={30}
            placeholder="+1 555 0100"
          />
        </div>
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label" htmlFor="pf-location">
          Location
        </label>
        <input
          id="pf-location"
          className="form-input"
          value={form.location}
          onChange={set("location")}
          maxLength={120}
          placeholder="City, State, Country"
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label" htmlFor="pf-avatar">
          Avatar URL
        </label>
        <input
          id="pf-avatar"
          type="url"
          className="form-input"
          value={form.avatar}
          onChange={set("avatar")}
          maxLength={2048}
          placeholder="https://res.cloudinary.com/…"
        />
        <p style={{ fontSize: 11, color: "var(--a-text-d)", marginTop: 4 }}>
          Leave blank to use the local /images/my-avatar.png fallback.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className="btn btn--primary"
          onClick={() => onSave(form)}
          disabled={!isValid || saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button className="btn btn--ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ================================================================== *
 * SocialLinkEditor — inline editor for a single social link row
 * ================================================================== */
function SocialLinkEditor({ link, onSave, onCancel }) {
  const [form, setForm] = useState({
    label: link.label ?? "",
    url: link.url ?? "",
    icon: link.icon ?? "",
  });

  const firstRef = useRef(null);
  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const isValid =
    form.label.trim() &&
    form.url.trim() &&
    form.icon.trim() &&
    /^https?:\/\/.+/.test(form.url.trim());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          ref={firstRef}
          className="form-input"
          placeholder="Label (e.g. LinkedIn)"
          value={form.label}
          onChange={set("label")}
          maxLength={50}
          style={{ fontSize: 13 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            className="form-input"
            placeholder="Icon key (e.g. linkedin)"
            value={form.icon}
            onChange={(e) =>
              setForm((p) => ({ ...p, icon: e.target.value.toLowerCase() }))
            }
            maxLength={40}
            style={{ fontSize: 13 }}
          />
          <span
            style={{
              fontSize: 20,
              color: "var(--a-text-m)",
              flexShrink: 0,
              lineHeight: 1,
            }}
            title={`Icon preview: ${form.icon || "fallback"}`}
          >
            {resolveIcon(form.icon)()}
          </span>
        </div>
      </div>

      <input
        className="form-input"
        type="url"
        placeholder="https://linkedin.com/in/…"
        value={form.url}
        onChange={set("url")}
        maxLength={2048}
        style={{ fontSize: 13 }}
      />

      <p style={{ fontSize: 11, color: "var(--light-gray)", margin: 0 }}>
        Supported icon keys: linkedin, github, leetcode, twitter, x, instagram,
        youtube, website, email
      </p>

      <div style={{ display: "flex", gap: 8 }}>
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
 * Main ManageProfile component
 * ================================================================== */
export default function ManageProfile() {
  const { data: profile, isLoading, isError, error } = useAdminProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  // Basic info editing state
  const [editingBasic, setEditingBasic] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);

  // Social links: which row is open and which is being deleted
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);
  const [savingLinks, setSavingLinks] = useState(false);

  // Local copy of links for optimistic reorder / add / cancel
  // null = no active edit session; fallback to server data
  const [localLinks, setLocalLinks] = useState(null);

  // Server-confirmed link order for dirty-check (mirrors serverSkills in ManageResume)
  const [serverLinks, setServerLinks] = useState(null);

  // Seed local state from server data when it first arrives
  useEffect(() => {
    if (profile && localLinks === null) {
      const sorted = [...(profile.socialLinks ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      const seeded = sorted.map((l) => ({ ...l, _tempId: l._id }));
      setLocalLinks(seeded);
      setServerLinks(seeded);
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Display list: prefer localLinks (active edit session) over server data.
   * useMemo avoids setState-in-effect anti-pattern.
   */
  const displayLinks = useMemo(() => {
    if (localLinks !== null) return localLinks;
    return [...(profile?.socialLinks ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((l) => ({ ...l, _tempId: l._id }));
  }, [localLinks, profile?.socialLinks]);

  /* ── Save basic info ─────────────────────────────────────────── */
  const handleSaveBasic = async (form) => {
    setSavingBasic(true);
    try {
      await updateProfile(form);
      setEditingBasic(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingBasic(false);
    }
  };

  /* ── Shared PATCH helper for social links ───────────────────── */
  const patchLinks = async (updatedLinks, { successMsg } = {}) => {
    setSavingLinks(true);
    try {
      const payload = stripTempIds(
        updatedLinks.map((l, i) => ({ ...l, order: i })),
      );
      const updated = await updateProfile({ socialLinks: payload });
      // Reseed both local and server snapshots from the confirmed server response
      const refreshed = [...(updated.socialLinks ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((l) => ({ ...l, _tempId: l._id }));
      setLocalLinks(refreshed);
      setServerLinks(refreshed);
      setEditingLinkId(null);
      toast.success(successMsg ?? "Social links updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingLinks(false);
    }
  };

  /* ── Save a single social link ──────────────────────────────── */
  const handleSaveLink = (tempId, formData) => {
    const updatedLinks = localLinks.map((l) =>
      l._tempId === tempId ? { ...l, ...formData } : l,
    );
    patchLinks(updatedLinks);
  };

  /* ── Delete a social link ───────────────────────────────────── */
  const handleDeleteLink = async (tempId, label) => {
    if (!window.confirm(`Delete the "${label}" link?`)) return;

    const updatedLinks = (localLinks ?? displayLinks).filter(
      (l) => l._tempId !== tempId,
    );
    setDeletingLinkId(tempId);

    try {
      await patchLinks(updatedLinks, {
        successMsg: `"${label}" link removed.`,
      });
    } finally {
      setDeletingLinkId(null);
    }
  };

  /* ── Add a new (unsaved) link row ───────────────────────────── */
  const handleAddLink = () => {
    const entry = newLink((localLinks ?? displayLinks).length);
    setLocalLinks((prev) => [...(prev ?? displayLinks), entry]);
    setEditingLinkId(entry._tempId);
  };

  /* ── Cancel editing a link ──────────────────────────────────── */
  const handleCancelLink = (tempId) => {
    const link = localLinks?.find((l) => l._tempId === tempId);
    if (link && !link._id) {
      setLocalLinks((prev) => prev?.filter((l) => l._tempId !== tempId) ?? []);
    }
    setEditingLinkId(null);
  };

  /* ── Reorder ────────────────────────────────────────────────── */
  const handleMoveLink = (index, direction) => {
    setLocalLinks((prev) => moveItem(prev, index, direction));
  };

  const handleSaveOrder = () => {
    patchLinks(localLinks, { successMsg: "Link order saved." });
  };

  /* ── Dirty-check: show "Save Order" when local order differs ── */
  const orderDirty =
    !savingLinks &&
    !editingLinkId &&
    localLinks !== null &&
    isOrderDirty(localLinks, serverLinks);

  /* ── Render guards ──────────────────────────────────────────── */
  if (isLoading || localLinks === null || serverLinks === null) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Profile</h2>
        </div>
        <AdminSkeleton rows={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Profile</h2>
        </div>
        <AdminError message={error?.message} />
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────────── */
  return (
    <div className="admin-page">
      {/* ══════════════════════════════════════════════════════════
          BASIC INFO
      ══════════════════════════════════════════════════════════ */}
      <div className="admin-page__header">
        <h2 className="admin-page__title">Profile</h2>
        {!editingBasic && (
          <button
            className="btn btn--primary"
            onClick={() => setEditingBasic(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {editingBasic ? (
        <BasicInfoForm
          profile={profile}
          onSave={handleSaveBasic}
          onCancel={() => setEditingBasic(false)}
          saving={savingBasic}
        />
      ) : (
        <div
          style={{
            background: "var(--a-surface)",
            border: "1px solid var(--a-border)",
            borderRadius: "var(--a-r-lg)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px 24px",
          }}
        >
          {[
            { label: "Name", value: profile.name },
            { label: "Title", value: profile.title },
            { label: "Email", value: profile.email },
            { label: "Phone", value: profile.phone || "—" },
            { label: "Location", value: profile.location || "—" },
            { label: "Avatar", value: profile.avatar || "(local fallback)" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--a-text-m)",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginBottom: 4,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--a-text)",
                  wordBreak: "break-word",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SOCIAL LINKS
      ══════════════════════════════════════════════════════════ */}
      <div className="admin-page__header" style={{ marginTop: 8 }}>
        <h2 className="admin-page__title">Social Links</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {orderDirty && (
            <button
              className="btn btn--primary"
              onClick={handleSaveOrder}
              disabled={savingLinks}
            >
              {savingLinks ? "Saving…" : "Save Order"}
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={handleAddLink}
            disabled={editingLinkId !== null || savingLinks}
          >
            + Add Link
          </button>
        </div>
      </div>

      {/* Helper note */}
      <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -8 }}>
        Use ↑ ↓ to reorder, then click <strong>Save Order</strong>.
      </p>

      {displayLinks.length === 0 && editingLinkId === null ? (
        <AdminEmpty
          icon="🔗"
          title="No social links yet"
          sub="Click Add Link above to add your first one."
        />
      ) : (
        <ul className="admin-list" aria-label="Social links">
          {displayLinks.map((link, index) => {
            const isEditing = editingLinkId === link._tempId;
            const isDeleting = deletingLinkId === link._tempId;
            const Icon = resolveIcon(link.icon);

            return (
              <SectionCard key={link._tempId}>
                {/* Reorder arrows — hidden while editing */}
                {!isEditing && (
                  <ReorderButtons
                    index={index}
                    total={displayLinks.length}
                    onMove={handleMoveLink}
                    disabled={editingLinkId !== null || savingLinks}
                  />
                )}

                <div className="admin-item__body">
                  {isEditing ? (
                    <SocialLinkEditor
                      link={link}
                      onSave={(formData) =>
                        handleSaveLink(link._tempId, formData)
                      }
                      onCancel={() => handleCancelLink(link._tempId)}
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            color: "var(--a-accent)",
                            lineHeight: 1,
                          }}
                        >
                          <Icon aria-hidden="true" />
                        </span>
                        <span className="admin-item__name">{link.label}</span>
                        <span
                          className="admin-item__badge"
                          style={{
                            background: "transparent",
                            color: "var(--a-text-d)",
                            borderColor: "var(--a-border)",
                            fontSize: 10,
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <div className="admin-item__meta">
                        <code
                          style={{
                            fontSize: 11,
                            color: "var(--a-text-d)",
                            background: "var(--a-surface-3)",
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontFamily: "monospace",
                          }}
                        >
                          {link.icon}
                        </code>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-item__preview"
                        style={{
                          color: "var(--a-text-m)",
                          textDecoration: "none",
                          fontSize: 12,
                        }}
                      >
                        {link.url}
                      </a>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="admin-item__actions">
                    <button
                      className="btn btn--ghost"
                      onClick={() => setEditingLinkId(link._tempId)}
                      disabled={
                        editingLinkId !== null || savingLinks || isDeleting
                      }
                      aria-label={`Edit ${link.label} link`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => handleDeleteLink(link._tempId, link.label)}
                      disabled={savingLinks || isDeleting}
                      aria-label={`Delete ${link.label} link`}
                    >
                      {isDeleting ? "…" : "Delete"}
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
