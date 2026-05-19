import { useState } from "react";
import api from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isFormValid =
    formData.fullname.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.message.trim() !== "";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      setLoading(true);
      setSuccessMsg("");
      setErrorMsg("");

      await api.post("/messages", formData);

      setSuccessMsg("Message sent successfully!");
      setFormData({ fullname: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      setErrorMsg("Something went wrong. Try again.");
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
          ></textarea>

          <button
            className="form-btn"
            type="submit"
            disabled={!isFormValid || loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {successMsg && <p className="success-msg">{successMsg}</p>}
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
        </form>
      </section>
    </article>
  );
}
