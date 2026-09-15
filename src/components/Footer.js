import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import { FaInstagram, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

/* Same links as the navbar — keeps Quick Links in sync with site navigation */
const navLinks = [
  { to: "/", label: "New Arrivals" },
  { to: "/product", label: "Sarees" },
  { to: "/jew", label: "Jewellery" },
  { to: "/contact", label: "Customer Support" },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Columns */}
        <div className="footer-column">
          <h3 className="footer-title">Lavanya Trends</h3>
          <p className="footer-text">
            Your one-stop shop for premium sarees and jewellery, curated with quality
            and care.
          </p>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Customer Service</h4>
          <ul className="footer-links">
            <li><Link to="/profile">Shipping Info</Link></li>
            <li><Link to="/profile">Returns</Link></li>
            <li><Link to="/contact">FAQ</Link></li>
            <li><Link to="/contact">Support</Link></li>
          </ul>
        </div>



        <div className="footer-column">
          <h4 className="footer-heading">Follow Us</h4>
          <div className="social-links">
            <a
              className="social"
              href="https://www.instagram.com/lavanyatrendsofficial?stkn=dThlNnZmODlvbTh3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              className="social"
              href="tel:+916379349734"
              aria-label="Call us"
            >
              <FaPhoneAlt />
            </a>

            {/* Optional: WhatsApp instead of / in addition to call */}
            <a
              className="social"
              href="https://wa.me/916379349734"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div >

      </div >

      <div className="footer-bottom">
        <p>&copy; 2026 Lavanya Trends. All rights reserved.</p>
      </div>
    </footer >
  );
};

export default Footer;