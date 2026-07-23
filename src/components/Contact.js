import { useState } from "react";
import "../styles/Contact.css";
import { FiMail, FiUsers, FiShoppingBag, FiStar, FiHeadphones, FiShield } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { FaPhoneAlt } from "react-icons/fa";
import WhyShopHub from "./WhyShopHub";

const STATS = [
  { icon: <FiUsers />, value: "10K+", label: "Happy Customers" },
  { icon: <FiShoppingBag />, value: "500+", label: "Premium Products" },
  { icon: <FiStar />, value: "4.8★", label: "Average Rating" },
  { icon: <FiHeadphones />, value: "24/7", label: "Customer Support" },
  { icon: <FiShield />, value: "100%", label: "Secure Shopping" },
];

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=500&q=80",
    alt: "Gold necklace and earrings",
  },
  {
    src: "https://images.unsplash.com/photo-1625980953551-50502b3b8b2f?auto=format&fit=crop&w=500&q=80",
    alt: "Pink lotus flower",
  },
  {
    src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80",
    alt: "Wrapped gift box",
  },
  {
    src: "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=500&q=80",
    alt: "Secure gold padlock",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [orderId, setOrderId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleWhatsAppSend = (e) => {
    e.preventDefault();

    const phoneNumber = "918610766168"; // ✅ WhatsApp number (no +)

    const whatsappMessage = `
Support Request

Name: ${name}
Email: ${email}
Mobile: ${mobile || "N/A"}
Order ID: ${orderId || "N/A"}
Issue Type: ${issueType || "N/A"}

Message:
${message}
    `;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Hook this up to your newsletter/email API
    setNewsletterEmail("");
  };

  return (
    <section className="contact" id="contact">
      <WhyShopHub />

      {/* HEADER */}
      <div className="contact-header">
        <span className="contact-eyebrow">Get In Touch</span>
        <h2>We're Here For You!</h2>
        <div className="contact-ornament">
          <span className="contact-ornament-line" />
          <span className="contact-ornament-dot">✦</span>
          <span className="contact-ornament-line" />
        </div>
        <p>
          Need help with an order, product, or delivery?
          Our support team is here to help.
        </p>
      </div>

      <div className="contact-body">
        {/* LEFT SIDE */}
        <div className="contact-left">
          {/* Maroon feature panel */}
          <div className="contact-feature">
            <h3>Your Satisfaction, Our Priority</h3>
            <span className="contact-feature-line" />
            <p>
              We are committed to providing the best shopping
              experience for you.
            </p>
            <img
              className="contact-feature-img"
              src="/ass/photo.avif"
              alt="Pink lotus flower"
            />
          </div>

          {/* Info panel */}
          <div className="contact-info">
            <div className="contact-item">
              <div className="icon">
                <FiMail />
              </div>
              <div className="text">
                <h4>Email Support</h4>
                <span>support@yourstore.com</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <FaWhatsapp />
              </div>
              <div className="text">
                <h4>WhatsApp</h4>
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <FaPhoneAlt />
              </div>
              <div className="text">
                <h4>Customer Care</h4>
                <span>Mon – Sat, 9 AM – 6 PM</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <IoLocationOutline />
              </div>
              <div className="text">
                <h4>Warehouse</h4>
                <span>Chennai, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — FORM */}
        <div className="contact-right">
          <h2>Submit a Support Request</h2>

          <form className="form" onSubmit={handleWhatsAppSend}>
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Order ID (Optional)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className="form-field">
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            <label>Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select an issue
              </option>
              <option>Order Issue</option>
              <option>Payment Problem</option>
              <option>Delivery Delay</option>
              <option>Return / Refund</option>
              <option>Product Enquiry</option>
            </select>

            <label>Message</label>
            <textarea
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>

            <button className="Con-btn" type="submit">
              Submit Request <LuSend />
            </button>
          </form>
        </div>
      </div>

      {/* STATS BAR */}
      {/* <div className="stats-bar">
        {STATS.map((stat, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div> */}

      {/* IMAGE GALLERY */}
      <div className="contact-gallery">
        {GALLERY.map((img, i) => (
          <div className="gallery-item" key={i}>
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        ))}
      </div>

      {/* NEWSLETTER */}
      <div className="newsletter-bar">
        <div className="newsletter-left">
          <div className="newsletter-icon">
            <FiMail />
          </div>
          <div className="newsletter-text">
            <h4>Stay Updated with Laranya Trends</h4>
            <p>
              Subscribe to get special offers, new arrivals & exclusive
              updates straight to your inbox.
            </p>
          </div>
        </div>

        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <br /> <br />
    </section>
  );
}