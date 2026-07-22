import { useState } from "react";
import "../styles/Contact.css";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { FaPhoneAlt } from "react-icons/fa";
import WhyShopHub from "./WhyShopHub";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [issueType, setIssueType] = useState("Order Issue");
  const [message, setMessage] = useState("");

  const handleWhatsAppSend = (e) => {
    e.preventDefault();

    const phoneNumber = "918610766168"; // ✅ WhatsApp number (no +)

    const whatsappMessage = `
Support Request

Name: ${name}
Email: ${email}
Order ID: ${orderId || "N/A"}
Issue Type: ${issueType}

Message:
${message}
    `;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");
  };

  return (
    <section className="contact" id="contact">
      <WhyShopHub />

      {/* HEADER */}
      <div className="contact-header">
        <span className="contact-eyebrow">Get In Touch</span>
        <h2>Customer Support</h2>
        <div className="contact-ornament">
          <span className="contact-ornament-line" />
          <span className="contact-ornament-dot">✦</span>
          <span className="contact-ornament-line" />
        </div>
        <p>
          Need help with an order, product, or delivery?
          Our support team is here for you.
        </p>
      </div>

      <div className="contact-body">
        {/* LEFT SIDE */}
        <div className="contact-left">
          <div className="contact-card">
            <h2>Contact Information</h2>

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

          {/* TRUST INFO */}
          <div className="contact-card">
            <h2>Why Shop With Us?</h2>
            <ul className="trust-list">
              <li>Secure Payments</li>
              <li>Fast Delivery</li>
              <li>Easy Returns</li>
              <li>24/7 Support</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-right">
          <h2>Submit a Support Request</h2>

          <form className="form" onSubmit={handleWhatsAppSend}>
            <label>Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Order ID (optional)</label>
            <input
              type="text"
              placeholder="#ORD123456"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />

            <label>Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option>Order Issue</option>
              <option>Payment Problem</option>
              <option>Delivery Delay</option>
              <option>Return / Refund</option>
              <option>Product Enquiry</option>
            </select>

            <label>Message</label>
            <textarea
              placeholder="Describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>

            <button className="Con-btn" type="submit">
              <LuSend /> Submit Request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}