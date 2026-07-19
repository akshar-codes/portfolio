import { useState } from "react";
import { Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationOnIcon } from "@mui/icons-material";

const SERVICES = [
  "Machine Learning",
  "Web Development",
  "Java Development",
  "Offer a role",
  "Other",
];

const CONTACT_INFO = [
  {
    icon: PhoneIcon,
    label: "Phone",
    value: "(+91) 8171156138",
    href: "tel:+918171156138",
  },
  {
    icon: EmailIcon,
    label: "Email",
    value: "bhavya2024wrk@gmail.com",
    href: "mailto:bhavya2024wrk@gmail.com",
  },
  {
    icon: LocationOnIcon,
    label: "Address",
    value: "Ashima Vihar, Turner Road, Majra,\nDehradun (Pin - 248002).",
    href: null,
  },
];

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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#00ff88";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--bg-primary)";
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitted(true);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <section className="section-container py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Form Card */}
          <div
            className="flex-1 w-full lg:w-2/3 rounded-2xl p-8 md:p-10"
            style={{
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,255,136,0.15)" }}
                >
                  <EmailIcon sx={{ color: "var(--accent)", fontSize: 32 }} />
                </div>
                <h3
                  className="font-mono text-xl font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  Message sent!
                </h3>
                <p
                  className="font-mono text-sm text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Thanks for reaching out. I'll get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#1c1c1e",
                  }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2
                  className="font-mono text-3xl md:text-4xl font-bold mb-8"
                  style={{ color: "var(--accent)" }}
                >
                  Let's work together
                </h2>

                {/* Row 1: First Name / Last Name */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={inputStyles}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={inputStyles}
                  />
                </div>

                {/* Row 2: Email / Phone */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange("email")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={inputStyles}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={inputStyles}
                  />
                </div>

                {/* Row 3: Service Select */}
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
                      color: form.service
                        ? "#ffffff"
                        : "#6b6b6e",
                    }}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 4: Message */}
                <div className="mb-6">
                  <textarea
                    placeholder="Type your message here."
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                      ...inputStyles,
                      resize: "vertical",
                      minHeight: "120px",
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#1c1c1e",
                    minWidth: "160px",
                    fontFamily: "Inter, sans-serif",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor =
                        "var(--accent-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent)";
                  }}
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
              </>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-10 lg:w-1/3 flex-shrink-0 w-full pt-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-6">
                {/* Icon square */}
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <Icon sx={{ color: "var(--accent)", fontSize: 24 }} />
                </div>

                <div>
                  <p
                    className="font-mono text-sm mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="font-mono text-base no-underline transition-colors duration-200"
                      style={{
                        color: "var(--text-primary)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                    >
                      {value}
                    </a>
                  ) : (
                    <p
                      className="font-mono text-base"
                      style={{
                        color: "var(--text-primary)",
                        whiteSpace: "pre-line",
                      }}
                    >
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
