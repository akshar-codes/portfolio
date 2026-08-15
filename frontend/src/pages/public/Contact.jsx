import { useState } from "react";
import { Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationOnIcon } from "@mui/icons-material";

import { useProfile } from "../../hooks/useProfile";
import { useAbout } from "../../hooks/useAbout";
import { usePublicSiteSettings, usePublicSeo } from "../../hooks/usePublicSite";
import { useSendMessage } from "../../hooks/useContactForm";
import { useDocumentHead } from "../../hooks/useDocumentHead";
import { isContactFormValid } from "../../validators/contact";
import { SkeletonBlock } from "../../components/public/Skeletons";

const EXTRA_SERVICE_OPTIONS = ["Offer a role", "Other"];

function formatAddress(address) {
  if (!address) return "";
  const { line1, line2, city, state, postalCode, country } = address;
  return [line1, line2, [city, state].filter(Boolean).join(", "), postalCode, country].filter(Boolean).join(", ");
}

const inputStyles = {
  width: "100%",
  padding: "14px 16px",
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--bg-primary)",
  borderRadius: "8px",
  color: "#ffffff",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.85rem",
  outline: "none",
  transition: "border-color 0.2s ease",
};

export default function Contact() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: about } = useAbout();
  const { data: settings } = usePublicSiteSettings();
  const { data: seo } = usePublicSeo();
  const { mutateAsync: sendMessage, isPending } = useSendMessage();

  useDocumentHead({
    title: seo?.defaultMetaTitle ? `Contact — ${seo.defaultMetaTitle}` : "Contact",
    description: seo?.defaultMetaDescription,
    image: seo?.openGraph?.image || seo?.defaultOgImage,
    canonical: seo?.canonicalBaseUrl ? `${seo.canonicalBaseUrl}/contact` : undefined,
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    website: "", // honeypot — always left empty by real visitors
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleFocus = (e) => (e.target.style.borderColor = "#00ff88");
  const handleBlur = (e) => (e.target.style.borderColor = "var(--bg-primary)");

  const serviceOptions = [...(about?.services ?? []).map((s) => s.title), ...EXTRA_SERVICE_OPTIONS];

  const contactEmail = settings?.contactEmails?.[0]?.email || profile?.email || "";
  const contactPhone = settings?.contactPhones?.[0]?.phone || profile?.phone || "";
  const contactAddress = formatAddress(settings?.contactAddress) || profile?.location || "";

  const contactInfo = [
    { icon: PhoneIcon, label: "Phone", value: contactPhone, href: contactPhone ? `tel:${contactPhone.replace(/\s+/g, "")}` : null },
    { icon: EmailIcon, label: "Email", value: contactEmail, href: contactEmail ? `mailto:${contactEmail}` : null },
    { icon: LocationOnIcon, label: "Address", value: contactAddress, href: null },
  ].filter((item) => item.value);

  const handleSubmit = async () => {
    setFormError("");

    const fullname = `${form.firstName} ${form.lastName}`.trim();
    if (!isContactFormValid({ fullname, email: form.email, message: form.message })) {
      setFormError("Please fill in your name, email, and a message of at least 10 characters.");
      return;
    }

    const composedMessage = [
      form.service && `Service interested in: ${form.service}`,
      form.phone && `Phone: ${form.phone}`,
      form.service || form.phone ? "\n" : "",
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await sendMessage({
        fullname,
        email: form.email,
        message: composedMessage,
        website: form.website,
      });
      setSubmitted(true);
      setForm({ firstName: "", lastName: "", email: "", phone: "", service: "", message: "", website: "" });
    } catch (err) {
      setFormError(err.message || "Something went wrong while sending your message. Please try again.");
    }
  };

  return (
    <div className="page-enter">
      <section className="section-container py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full lg:w-2/3 rounded-2xl p-8 md:p-10" style={{ backgroundColor: "var(--bg-secondary)" }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,255,136,0.15)" }}>
                  <EmailIcon sx={{ color: "var(--accent)", fontSize: 32 }} />
                </div>
                <h3 className="font-mono text-xl font-bold" style={{ color: "var(--accent)" }}>
                  Message sent!
                </h3>
                <p className="font-mono text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: "var(--accent)", color: "#1c1c1e" }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-mono text-3xl md:text-4xl font-bold mb-8" style={{ color: "var(--accent)" }}>
                  Let&apos;s work together
                </h2>

                {formError && (
                  <div
                    className="font-mono text-xs px-4 py-3 rounded-lg mb-6"
                    style={{ backgroundColor: "rgba(214,83,74,0.12)", border: "1px solid rgba(214,83,74,0.35)", color: "#e08c85" }}
                    role="alert"
                  >
                    {formError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input type="text" placeholder="First Name" value={form.firstName} onChange={handleChange("firstName")} onFocus={handleFocus} onBlur={handleBlur} style={inputStyles} />
                  <input type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange("lastName")} onFocus={handleFocus} onBlur={handleBlur} style={inputStyles} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input type="email" placeholder="Email Address" value={form.email} onChange={handleChange("email")} onFocus={handleFocus} onBlur={handleBlur} style={inputStyles} />
                  <input type="tel" placeholder="Phone" value={form.phone} onChange={handleChange("phone")} onFocus={handleFocus} onBlur={handleBlur} style={inputStyles} />
                </div>

                <div className="mb-4">
                  <select
                    value={form.service}
                    onChange={handleChange("service")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                      ...inputStyles,
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b6e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      paddingRight: "40px",
                      color: form.service ? "#ffffff" : "#6b6b6e",
                    }}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <textarea
                    placeholder="Type your message here."
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ ...inputStyles, resize: "vertical", minHeight: "120px" }}
                  />
                </div>

                {/* Honeypot — hidden from real visitors, tripped only by bots */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange("website")}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  aria-hidden="true"
                />

                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#1c1c1e",
                    minWidth: "160px",
                    fontFamily: "Inter, sans-serif",
                    opacity: isPending ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isPending) e.currentTarget.style.backgroundColor = "var(--accent-dark)";
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                >
                  {isPending ? "Sending..." : "Send message"}
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-10 lg:w-1/3 flex-shrink-0 w-full pt-4">
            {profileLoading &&
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6">
                  <SkeletonBlock className="w-14 h-14 rounded-lg flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-4 w-40" />
                  </div>
                </div>
              ))}

            {!profileLoading && contactInfo.length === 0 && (
              <p className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                Contact information coming soon.
              </p>
            )}

            {!profileLoading &&
              contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <Icon sx={{ color: "var(--accent)", fontSize: 24 }} />
                  </div>
                  <div>
                    <p className="font-mono text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-mono text-base no-underline transition-colors duration-200"
                        style={{ color: "var(--text-primary)", textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-mono text-base" style={{ color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
