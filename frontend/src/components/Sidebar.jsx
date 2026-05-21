import { useState } from "react";
import {
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoChevronDown,
} from "react-icons/io5";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className={`sidebar ${isOpen ? "active" : ""}`}
      aria-label="Profile and contact information"
    >
      <div className="sidebar-info">
        <figure className="avatar-box">
          <img src="/images/my-avatar.png" alt="Akshar Gupta" width="80" />
        </figure>

        <div className="info-content">
          <h1 className="name" title="Akshar Gupta">
            Akshar Gupta
          </h1>
          <p className="title">Web Developer</p>
        </div>

        <button
          className="info_more-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="sidebar-contacts"
        >
          <span>{isOpen ? "Hide Contacts" : "Show Contacts"}</span>
          <IoChevronDown aria-hidden="true" />
        </button>
      </div>

      <div
        id="sidebar-contacts"
        className="sidebar-info_more"
        aria-hidden={!isOpen}
      >
        <div className="separator" role="separator" />

        <ul className="contacts-list" role="list">
          <li className="contact-item">
            <div className="icon-box" aria-hidden="true">
              <IoMailOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a
                href="mailto:akshargupta2006@gmail.com"
                className="contact-link"
                aria-label="Send email to akshargupta2006@gmail.com"
              >
                akshargupta2006 <br /> @gmail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box" aria-hidden="true">
              <IoPhonePortraitOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a
                href="tel:+919258887187"
                className="contact-link"
                aria-label="Call +91 92588 87187"
              >
                +91 9258887187
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box" aria-hidden="true">
              <IoLocationOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>Meerut, Uttar Pradesh, India</address>
            </div>
          </li>
        </ul>

        <div className="separator" role="separator" />

        <ul className="social-list" role="list" aria-label="Social media links">
          <li className="social-item">
            <a
              href="https://www.linkedin.com/in/akshar-gupta"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Akshar Gupta on LinkedIn — opens in new tab"
            >
              <FaLinkedin aria-hidden="true" />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://github.com/gupta-akshar"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Akshar Gupta on GitHub — opens in new tab"
            >
              <FaGithub aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
