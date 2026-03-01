import { useState } from "react";
import {
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoChevronDown,
} from "react-icons/io5";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="sidebar-info">
        <figure className="avatar-box">
          {/* Correct path for Vite public folder */}
          <img src="/images/my-avatar.png" alt="Akshar Gupta" width="80" />
        </figure>

        <div className="info-content">
          <h1 className="name" title="Akshar Gupta">
            Akshar Gupta
          </h1>
          <p className="title">Web Developer</p>
        </div>

        <button className="info_more-btn" onClick={() => setIsOpen(!isOpen)}>
          <span>Show Contacts</span>
          <IoChevronDown />
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <IoMailOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a
                href="mailto:akshargupta2006@gmail.com"
                className="contact-link"
              >
                akshargupta2006 <br /> @gmail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <IoPhonePortraitOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="tel:+919258887187" className="contact-link">
                +91 9258887187
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <IoLocationOutline />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>Meerut, Uttar Pradesh, India</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a
              href="https://www.linkedin.com/in/akshar-gupta"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://github.com/gupta-akshar"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
            </a>
          </li>

          {/* <li className="social-item">
            <a
              href="#"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </li> */}
        </ul>
      </div>
    </aside>
  );
}
