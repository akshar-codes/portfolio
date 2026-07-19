import { useState } from "react";
import { toast } from "sonner";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { isContactFormValid } from "../../validators/contact";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    message: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);

  const isFormValid = isContactFormValid(formData);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      await api.post(API_ENDPOINTS.messages, formData);
      toast.success("Message sent successfully!");
      setFormData({ fullname: "", email: "", message: "", website: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="contact active">
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Full name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your message"
            value={formData.message}
            onChange={handleChange}
            required
          />

          {/* Honeypot — hidden from real users, catches bots */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              opacity: 0,
              pointerEvents: "none",
            }}
          />

          <button
            className="form-btn"
            type="submit"
            disabled={!isFormValid || loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </article>
  );
}
