import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  useSiteSettingsQuery,
  useUpdateSiteSettings,
  usePublishSiteSettings,
  useUnpublishSiteSettings,
  useUploadLogo,
  useRemoveLogo,
  useUploadFavicon,
  useRemoveFavicon,
} from "../../hooks/useSiteSettings";
import { stripTempIds } from "../../utils/ordering";
import { ROUTES } from "../../constants/routes";
import LogoFaviconUploader from "../../components/common/LogoFaviconUploader";
import SectionCard from "../../components/common/SectionCard";
import {
  AdminSkeleton,
  AdminEmpty,
  AdminError,
} from "../../components/common/AdminStatus";

/* ================================================================== *
 * Constants
 * ================================================================== */

const THEME_MODES = ["light", "dark", "system"];
const CONTACT_EMAILS_MAX = 5;
const CONTACT_PHONES_MAX = 5;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SECTIONS = [
  { id: "website", label: "Website", icon: "🌐" },
  { id: "logo", label: "Logo & Favicon", icon: "🖼️" },
  { id: "colors", label: "Brand Colors", icon: "🎨" },
  { id: "announcement", label: "Announcement Bar", icon: "📢" },
  { id: "contact", label: "Contact Information", icon: "📇" },
  { id: "resume", label: "Resume", icon: "📄" },
  { id: "theme", label: "Theme", icon: "🌗" },
  { id: "analytics", label: "Analytics IDs", icon: "📊" },
  { id: "maintenance", label: "Maintenance Mode", icon: "🚧" },
  { id: "social", label: "Social Links", icon: "🔗" },
];

function newTempRow(fields) {
  return { _tempId: crypto.randomUUID(), ...fields };
}

const rowStyle = { display: "flex", alignItems: "center", gap: 10 };
const checkboxFieldStyle = {
  ...rowStyle,
  display: "flex",
};

/* ================================================================== *
 * WebsiteSection
 * ================================================================== */
function WebsiteSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    siteName: settings.siteName ?? "",
    tagline: settings.tagline ?? "",
    timezone: settings.timezone ?? "",
    defaultLocale: settings.defaultLocale ?? "",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const isValid = form.siteName.trim().length >= 2;

  return (
    <div className="admin-form" style={{ maxWidth: 560 }}>
      <div className="admin-form__field">
        <label className="admin-form__label" htmlFor="ss-siteName">
          Site Name <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <input
          id="ss-siteName"
          className="form-input"
          value={form.siteName}
          onChange={set("siteName")}
          maxLength={100}
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label" htmlFor="ss-tagline">
          Tagline
        </label>
        <input
          id="ss-tagline"
          className="form-input"
          value={form.tagline}
          onChange={set("tagline")}
          maxLength={200}
        />
      </div>

      <div className="admin-form__row admin-form__row--2col">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="ss-timezone">
            Timezone
          </label>
          <input
            id="ss-timezone"
            className="form-input"
            value={form.timezone}
            onChange={set("timezone")}
            maxLength={60}
            placeholder="Asia/Kolkata"
          />
        </div>
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="ss-locale">
            Default Locale
          </label>
          <input
            id="ss-locale"
            className="form-input"
            value={form.defaultLocale}
            onChange={set("defaultLocale")}
            maxLength={10}
            placeholder="en"
          />
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={() => onSave(form)}
        disabled={!isValid || saving}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * LogoFaviconSection
 * ================================================================== */
function LogoFaviconSection({ settings }) {
  const { mutateAsync: uploadLogo } = useUploadLogo();
  const { mutateAsync: removeLogo } = useRemoveLogo();
  const { mutateAsync: uploadFavicon } = useUploadFavicon();
  const { mutateAsync: removeFavicon } = useRemoveFavicon();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <LogoFaviconUploader
        label="Logo"
        hint="Displayed in the site header/navbar. JPG, PNG, WEBP, or GIF — max 5 MB."
        asset={settings.logo}
        onUpload={(file) => uploadLogo({ file })}
        onRemove={() => removeLogo()}
        shape="rect"
      />
      <LogoFaviconUploader
        label="Favicon"
        hint="Shown in the browser tab. A square image works best."
        asset={settings.favicon}
        onUpload={(file) => uploadFavicon({ file })}
        onRemove={() => removeFavicon()}
        shape="square"
      />
    </div>
  );
}

/* ================================================================== *
 * BrandColorsSection
 * ================================================================== */
function ColorField({ label, value, onChange }) {
  return (
    <div className="admin-form__field">
      <label className="admin-form__label">{label}</label>
      <div style={rowStyle}>
        <input
          type="color"
          value={HEX_COLOR_RE.test(value) ? value.slice(0, 7) : "#000000"}
          onChange={onChange}
          style={{
            width: 44,
            height: 36,
            border: "1px solid var(--jet)",
            borderRadius: 8,
            background: "none",
            cursor: "pointer",
            padding: 0,
          }}
        />
        <input className="form-input" value={value} onChange={onChange} maxLength={9} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

function BrandColorsSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    primaryColor: settings.primaryColor ?? "#00ff88",
    secondaryColor: settings.secondaryColor ?? "#1c1c1e",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const isValid = HEX_COLOR_RE.test(form.primaryColor) && HEX_COLOR_RE.test(form.secondaryColor);

  return (
    <div className="admin-form" style={{ maxWidth: 480 }}>
      <ColorField label="Primary Color" value={form.primaryColor} onChange={set("primaryColor")} />
      <ColorField label="Secondary Color" value={form.secondaryColor} onChange={set("secondaryColor")} />

      <button
        className="btn btn--primary"
        onClick={() => onSave(form)}
        disabled={!isValid || saving}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * AnnouncementBarSection
 * ================================================================== */
function AnnouncementBarSection({ settings, onSave, saving }) {
  const bar = settings.announcementBar ?? {};
  const [form, setForm] = useState({
    enabled: bar.enabled ?? false,
    message: bar.message ?? "",
    ctaLabel: bar.ctaLabel ?? "",
    ctaUrl: bar.ctaUrl ?? "",
    backgroundColor: bar.backgroundColor ?? "#00ff88",
    textColor: bar.textColor ?? "#1c1c1e",
    dismissible: bar.dismissible ?? true,
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setBool = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
      {/* Live preview */}
      <div
        style={{
          borderRadius: 10,
          padding: "12px 18px",
          background: HEX_COLOR_RE.test(form.backgroundColor) ? form.backgroundColor : "#00ff88",
          color: HEX_COLOR_RE.test(form.textColor) ? form.textColor : "#1c1c1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          opacity: form.enabled ? 1 : 0.4,
          transition: "opacity 0.2s",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {form.message || "Your announcement message will appear here."}
        </span>
        {form.ctaLabel && (
          <span style={{ fontSize: 12, fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}>
            {form.ctaLabel}
          </span>
        )}
      </div>

      <div className="admin-form">
        <div className="admin-form__field" style={checkboxFieldStyle}>
          <input id="ab-enabled" type="checkbox" checked={form.enabled} onChange={setBool("enabled")} />
          <label htmlFor="ab-enabled" className="admin-form__label" style={{ marginBottom: 0 }}>
            Enabled
          </label>
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="ab-message">
            Message
          </label>
          <textarea
            id="ab-message"
            className="form-input"
            value={form.message}
            onChange={set("message")}
            maxLength={300}
            style={{ minHeight: 70, resize: "vertical" }}
          />
        </div>

        <div className="admin-form__row admin-form__row--2col">
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="ab-ctaLabel">
              CTA Label
            </label>
            <input
              id="ab-ctaLabel"
              className="form-input"
              value={form.ctaLabel}
              onChange={set("ctaLabel")}
              maxLength={40}
            />
          </div>
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="ab-ctaUrl">
              CTA URL
            </label>
            <input
              id="ab-ctaUrl"
              className="form-input"
              value={form.ctaUrl}
              onChange={set("ctaUrl")}
              placeholder="/contact or https://…"
            />
          </div>
        </div>

        <div className="admin-form__row admin-form__row--2col">
          <ColorField label="Background Color" value={form.backgroundColor} onChange={set("backgroundColor")} />
          <ColorField label="Text Color" value={form.textColor} onChange={set("textColor")} />
        </div>

        <div className="admin-form__field" style={checkboxFieldStyle}>
          <input id="ab-dismissible" type="checkbox" checked={form.dismissible} onChange={setBool("dismissible")} />
          <label htmlFor="ab-dismissible" className="admin-form__label" style={{ marginBottom: 0 }}>
            Visitors can dismiss it
          </label>
        </div>

        <button
          className="btn btn--primary"
          onClick={() => onSave({ announcementBar: form })}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ContactSection — Emails, Phones, Address
 * ================================================================== */
function ContactEmailRow({ item, onChange, onDelete }) {
  return (
    <SectionCard>
      <div className="admin-item__body" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
        <input
          className="form-input"
          placeholder="Label (e.g. General)"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          maxLength={50}
        />
        <input
          className="form-input"
          type="email"
          placeholder="name@example.com"
          value={item.email}
          onChange={(e) => onChange({ ...item, email: e.target.value })}
          maxLength={254}
        />
      </div>
      <div className="admin-item__actions">
        <button className="btn btn--danger" onClick={onDelete} aria-label={`Remove ${item.label || "email"}`}>
          Remove
        </button>
      </div>
    </SectionCard>
  );
}

function ContactPhoneRow({ item, onChange, onDelete }) {
  return (
    <SectionCard>
      <div className="admin-item__body" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
        <input
          className="form-input"
          placeholder="Label (e.g. Mobile)"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          maxLength={50}
        />
        <input
          className="form-input"
          placeholder="+1 555 0100"
          value={item.phone}
          onChange={(e) => onChange({ ...item, phone: e.target.value })}
          maxLength={30}
        />
      </div>
      <div className="admin-item__actions">
        <button className="btn btn--danger" onClick={onDelete} aria-label={`Remove ${item.label || "phone"}`}>
          Remove
        </button>
      </div>
    </SectionCard>
  );
}

function ContactSection({ settings, onSave, saving }) {
  const [emails, setEmails] = useState(
    (settings.contactEmails ?? []).map((e) => ({ ...e, _tempId: e._id })),
  );
  const [phones, setPhones] = useState(
    (settings.contactPhones ?? []).map((p) => ({ ...p, _tempId: p._id })),
  );

  const address = settings.contactAddress ?? {};
  const [addressForm, setAddressForm] = useState({
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country ?? "",
  });
  const setAddr = (field) => (e) => setAddressForm((p) => ({ ...p, [field]: e.target.value }));

  const addEmail = () => setEmails((p) => [...p, newTempRow({ label: "", email: "" })]);
  const updateEmail = (tempId, next) =>
    setEmails((p) => p.map((e) => (e._tempId === tempId ? next : e)));
  const deleteEmail = (tempId) => setEmails((p) => p.filter((e) => e._tempId !== tempId));

  const addPhone = () => setPhones((p) => [...p, newTempRow({ label: "", phone: "" })]);
  const updatePhone = (tempId, next) =>
    setPhones((p) => p.map((ph) => (ph._tempId === tempId ? next : ph)));
  const deletePhone = (tempId) => setPhones((p) => p.filter((ph) => ph._tempId !== tempId));

  const emailsValid = emails.every((e) => e.label.trim() && EMAIL_RE.test(e.email));
  const phonesValid = phones.every((p) => p.label.trim() && p.phone.trim());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Emails */}
      <div>
        <div className="admin-page__header" style={{ marginTop: 0 }}>
          <h3 className="admin-page__title" style={{ fontSize: 16 }}>
            Emails
          </h3>
          <button className="btn btn--ghost" onClick={addEmail} disabled={emails.length >= CONTACT_EMAILS_MAX}>
            + Add Email
          </button>
        </div>

        {emails.length === 0 ? (
          <AdminEmpty icon="✉️" title="No emails yet" sub="Add a contact email visitors can reach you at." />
        ) : (
          <ul className="admin-list" aria-label="Contact emails">
            {emails.map((item) => (
              <ContactEmailRow
                key={item._tempId}
                item={item}
                onChange={(next) => updateEmail(item._tempId, next)}
                onDelete={() => deleteEmail(item._tempId)}
              />
            ))}
          </ul>
        )}

        <button
          className="btn btn--primary"
          style={{ marginTop: 12 }}
          onClick={() => onSave({ contactEmails: stripTempIds(emails) })}
          disabled={!emailsValid || saving}
        >
          {saving ? "Saving…" : "Save Emails"}
        </button>
      </div>

      {/* Phones */}
      <div>
        <div className="admin-page__header" style={{ marginTop: 0 }}>
          <h3 className="admin-page__title" style={{ fontSize: 16 }}>
            Phones
          </h3>
          <button className="btn btn--ghost" onClick={addPhone} disabled={phones.length >= CONTACT_PHONES_MAX}>
            + Add Phone
          </button>
        </div>

        {phones.length === 0 ? (
          <AdminEmpty icon="📞" title="No phone numbers yet" sub="Add a contact number visitors can reach you at." />
        ) : (
          <ul className="admin-list" aria-label="Contact phones">
            {phones.map((item) => (
              <ContactPhoneRow
                key={item._tempId}
                item={item}
                onChange={(next) => updatePhone(item._tempId, next)}
                onDelete={() => deletePhone(item._tempId)}
              />
            ))}
          </ul>
        )}

        <button
          className="btn btn--primary"
          style={{ marginTop: 12 }}
          onClick={() => onSave({ contactPhones: stripTempIds(phones) })}
          disabled={!phonesValid || saving}
        >
          {saving ? "Saving…" : "Save Phones"}
        </button>
      </div>

      {/* Address */}
      <div>
        <div className="admin-page__header" style={{ marginTop: 0 }}>
          <h3 className="admin-page__title" style={{ fontSize: 16 }}>
            Address
          </h3>
        </div>

        <div className="admin-form" style={{ maxWidth: 560 }}>
          <div className="admin-form__field">
            <label className="admin-form__label">Address Line 1</label>
            <input className="form-input" value={addressForm.line1} onChange={setAddr("line1")} maxLength={150} />
          </div>
          <div className="admin-form__field">
            <label className="admin-form__label">Address Line 2</label>
            <input className="form-input" value={addressForm.line2} onChange={setAddr("line2")} maxLength={150} />
          </div>
          <div className="admin-form__row admin-form__row--2col">
            <div className="admin-form__field">
              <label className="admin-form__label">City</label>
              <input className="form-input" value={addressForm.city} onChange={setAddr("city")} maxLength={100} />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">State</label>
              <input className="form-input" value={addressForm.state} onChange={setAddr("state")} maxLength={100} />
            </div>
          </div>
          <div className="admin-form__row admin-form__row--2col">
            <div className="admin-form__field">
              <label className="admin-form__label">Postal Code</label>
              <input
                className="form-input"
                value={addressForm.postalCode}
                onChange={setAddr("postalCode")}
                maxLength={20}
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label">Country</label>
              <input className="form-input" value={addressForm.country} onChange={setAddr("country")} maxLength={100} />
            </div>
          </div>

          <button
            className="btn btn--primary"
            onClick={() => onSave({ contactAddress: addressForm })}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ResumeDownloadSection
 * ================================================================== */
function ResumeDownloadSection({ settings, onSave, saving }) {
  const rd = settings.resumeDownload ?? {};
  const [form, setForm] = useState({
    enabled: rd.enabled ?? false,
    url: rd.url ?? "",
    label: rd.label ?? "Download CV",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setBool = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }));

  return (
    <div className="admin-form" style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -4 }}>
        Controls a site-wide "Download CV" call to action (e.g. navbar). This is
        independent of the Resume page&apos;s own content — manage that under{" "}
        <Link to={ROUTES.adminResume} style={{ color: "var(--orange-yellow-crayola)" }}>
          Resume
        </Link>
        .
      </p>

      <div className="admin-form__field" style={checkboxFieldStyle}>
        <input id="rd-enabled" type="checkbox" checked={form.enabled} onChange={setBool("enabled")} />
        <label htmlFor="rd-enabled" className="admin-form__label" style={{ marginBottom: 0 }}>
          Enabled
        </label>
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">Download URL</label>
        <input
          className="form-input"
          type="url"
          value={form.url}
          onChange={set("url")}
          placeholder="https://res.cloudinary.com/…/resume.pdf"
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">Button Label</label>
        <input className="form-input" value={form.label} onChange={set("label")} maxLength={40} />
      </div>

      <button className="btn btn--primary" onClick={() => onSave({ resumeDownload: form })} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * ThemeSection
 * ================================================================== */
function ThemeSection({ settings, onSave, saving }) {
  const [mode, setMode] = useState(settings.theme?.mode ?? "dark");

  return (
    <div className="admin-form" style={{ maxWidth: 400 }}>
      <div className="admin-form__field">
        <label className="admin-form__label" htmlFor="theme-mode">
          Default Theme Mode
        </label>
        <select
          id="theme-mode"
          className="form-input"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {THEME_MODES.map((m) => (
            <option key={m} value={m}>
              {m[0].toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn--primary" onClick={() => onSave({ theme: { mode } })} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * AnalyticsSection
 * ================================================================== */
const ANALYTICS_FIELDS = [
  { key: "googleAnalyticsId", label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
  { key: "googleTagManagerId", label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX" },
  { key: "facebookPixelId", label: "Facebook Pixel ID", placeholder: "123456789012345" },
  { key: "hotjarId", label: "Hotjar Site ID", placeholder: "1234567" },
  { key: "microsoftClarityId", label: "Microsoft Clarity ID", placeholder: "abcdefghij" },
];

function AnalyticsSection({ settings, onSave, saving }) {
  const a = settings.analytics ?? {};
  const [form, setForm] = useState({
    googleAnalyticsId: a.googleAnalyticsId ?? "",
    googleTagManagerId: a.googleTagManagerId ?? "",
    facebookPixelId: a.facebookPixelId ?? "",
    hotjarId: a.hotjarId ?? "",
    microsoftClarityId: a.microsoftClarityId ?? "",
  });
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="admin-form" style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -4 }}>
        Tracking/tag-manager IDs only. SEO-specific fields (meta title/description,
        Google Search Console verification) remain under the SEO module.
      </p>

      {ANALYTICS_FIELDS.map(({ key, label, placeholder }) => (
        <div className="admin-form__field" key={key}>
          <label className="admin-form__label">{label}</label>
          <input className="form-input" value={form[key]} onChange={set(key)} maxLength={40} placeholder={placeholder} />
        </div>
      ))}

      <button className="btn btn--primary" onClick={() => onSave({ analytics: form })} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * MaintenanceSection
 * ================================================================== */
function MaintenanceSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    maintenanceMode: settings.maintenanceMode ?? false,
    maintenanceMessage: settings.maintenanceMessage ?? "",
  });

  const setBool = (e) => setForm((p) => ({ ...p, maintenanceMode: e.target.checked }));
  const setMsg = (e) => setForm((p) => ({ ...p, maintenanceMessage: e.target.value }));

  return (
    <div className="admin-form" style={{ maxWidth: 560 }}>
      {form.maintenanceMode && (
        <div
          style={{
            background: "hsla(45,100%,72%,0.1)",
            border: "1px solid hsla(45,100%,72%,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: "var(--orange-yellow-crayola)",
          }}
        >
          Note: this flag is stored for the public site to read, but it isn&apos;t
          yet wired into request-level gating on the backend — enabling it does
          not currently block traffic on its own.
        </div>
      )}

      <div className="admin-form__field" style={checkboxFieldStyle}>
        <input id="mm-enabled" type="checkbox" checked={form.maintenanceMode} onChange={setBool} />
        <label htmlFor="mm-enabled" className="admin-form__label" style={{ marginBottom: 0 }}>
          Maintenance Mode Enabled
        </label>
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">Maintenance Message</label>
        <textarea
          className="form-input"
          value={form.maintenanceMessage}
          onChange={setMsg}
          maxLength={500}
          style={{ minHeight: 80, resize: "vertical" }}
        />
      </div>

      <button className="btn btn--primary" onClick={() => onSave(form)} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * SocialLinksSection
 * ================================================================== */
function SocialLinksSection({ settings, onSave, saving }) {
  const [enabled, setEnabled] = useState(settings.socialLinksEnabled ?? true);

  return (
    <div className="admin-form" style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 12, color: "var(--light-gray)", marginTop: -4 }}>
        This is a site-wide visibility switch only. The links themselves are
        managed under{" "}
        <Link to={ROUTES.adminProfile} style={{ color: "var(--orange-yellow-crayola)" }}>
          Profile → Social Links
        </Link>
        .
      </p>

      <div className="admin-form__field" style={checkboxFieldStyle}>
        <input id="sl-enabled" type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <label htmlFor="sl-enabled" className="admin-form__label" style={{ marginBottom: 0 }}>
          Show social links on the public site
        </label>
      </div>

      <button
        className="btn btn--primary"
        onClick={() => onSave({ socialLinksEnabled: enabled })}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ================================================================== *
 * Main ManageSiteSettings component
 * ================================================================== */
export default function ManageSiteSettings() {
  const { data: settings, isLoading, isError, error, refetch } = useSiteSettingsQuery();
  const { mutateAsync: updateSiteSettings, isPending: saving } = useUpdateSiteSettings();
  const { mutateAsync: publish, isPending: publishing } = usePublishSiteSettings();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishSiteSettings();

  const [activeSection, setActiveSection] = useState("website");

  const handleSave = async (payload) => {
    try {
      await updateSiteSettings(payload);
      toast.success("Site settings updated.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (settings.status === "draft") {
        await publish();
        toast.success("Site settings published.");
      } else {
        await unpublish();
        toast.success("Site settings unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Site Settings</h2>
        </div>
        <AdminSkeleton rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Site Settings</h2>
        </div>
        <AdminError message={error?.message} onRetry={refetch} />
      </div>
    );
  }

  const isDraft = settings.status === "draft";

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Site Settings</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            className="admin-item__badge"
            style={
              isDraft
                ? { background: "transparent", color: "var(--light-gray)", borderColor: "var(--jet)" }
                : undefined
            }
          >
            {isDraft ? "Draft" : "Published"}
          </span>
          <button
            className="btn btn--ghost"
            onClick={handleTogglePublish}
            disabled={publishing || unpublishing}
          >
            {publishing || unpublishing ? "…" : isDraft ? "Publish" : "Unpublish"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Section nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 210, flexShrink: 0 }}>
          {SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className="btn"
                style={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  background: active ? "var(--onyx)" : "transparent",
                  border: "1px solid",
                  borderColor: active ? "var(--orange-yellow-crayola)" : "transparent",
                  color: active ? "var(--orange-yellow-crayola)" : "var(--light-gray)",
                }}
              >
                <span style={{ marginRight: 8 }}>{s.icon}</span>
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Active section content */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {activeSection === "website" && (
            <WebsiteSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "logo" && <LogoFaviconSection settings={settings} />}
          {activeSection === "colors" && (
            <BrandColorsSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "announcement" && (
            <AnnouncementBarSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "contact" && (
            <ContactSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "resume" && (
            <ResumeDownloadSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "theme" && (
            <ThemeSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "analytics" && (
            <AnalyticsSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "maintenance" && (
            <MaintenanceSection settings={settings} onSave={handleSave} saving={saving} />
          )}
          {activeSection === "social" && (
            <SocialLinksSection settings={settings} onSave={handleSave} saving={saving} />
          )}
        </div>
      </div>
    </div>
  );
}
