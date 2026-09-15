import { useState, useEffect, useRef } from "react";
import "../styles/Contact.css";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { FaPhoneAlt } from "react-icons/fa";
import WhyShopHub from "./WhyShopHub";


const API_URL = process.env.REACT_APP_API_URL || "https://mediumorchid-rhinoceros-818505.hostingersite.com";

// The UI shows friendly issue labels, but the API expects one of a
// fixed set of requestType values — map one to the other here.
const ISSUE_TYPE_TO_REQUEST_TYPE = {
  "Order Issue": "order_inquiry",
  "Payment Problem": "complaint",
  "Delivery Delay": "complaint",
  "Return / Refund": "complaint",
  "Product Enquiry": "inquiry",
};



const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=500&q=80",
    alt: "Gold necklace and earrings",
  },
  {
    src: "/ass/saree1.jpg",
    alt: "Pink lotus flower",
  },
  {
    src: "/ass/jw2.jpg",
    alt: "Wrapped gift box",
  },
  {
    src: "/ass/saree2.jpg",
    alt: "Secure gold padlock",
  },
];

// Max attachment size the API accepts (5MB), enforced client-side so
// the user gets instant feedback instead of a failed request.
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

// Wait this long after the user stops typing their name before
// looking up their orders / auto-filling email & phone.
const NAME_LOOKUP_DEBOUNCE_MS = 600;

// Only trigger the lookup once the name looks like a real attempt,
// not on the very first keystroke.
const MIN_NAME_LENGTH_FOR_LOOKUP = 2;

// Backend requires the message to be at least this many characters —
// validate client-side so the user gets instant feedback.
const MIN_MESSAGE_LENGTH = 10;

// Reads the logged-in user's id out of localStorage. Adjust the key
// name below ("user") if your login flow writes to a different key.
const getCurrentUserId = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.id ?? null;
  } catch (err) {
    console.error("Failed to read user from localStorage:", err);
    return null;
  }
};

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Order dropdown: fetched from the logged-in user's orders, shown
  // by product name so the user can pick which purchase they mean.
  const [orderOptions, setOrderOptions] = useState([]); // [{ value, label }]
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Prevents re-fetching/re-autofilling every time the name changes
  // once we've already done it once for this visit.
  const hasAutofilledRef = useRef(false);
  const debounceTimerRef = useRef(null);

  const lookupAndAutofill = async () => {
    if (hasAutofilledRef.current) return;

    const userId = getCurrentUserId();
    if (!userId) return;

    hasAutofilledRef.current = true;
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const res = await fetch(`${API_URL}/orders/get-user-order/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const orders = data.orders || [];

      // Flatten: one dropdown option per order item, labelled with
      // the product name and order number, valued by the order id.
      const options = orders.flatMap((order) =>
        (order.items || []).map((item) => ({
          value: String(order.id),
          label: `${item.productName}`,
        }))
      );
      setOrderOptions(options);

      // Auto-fill email & phone from the order's user/customer data —
      // only if the user hasn't already typed something into them.
      const customer = orders[0]?.customer;
      const user = orders[0]?.user;
      setEmail((prev) => prev || user?.email || customer?.email || "");
      setMobile((prev) => prev || customer?.phone || "");
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      setOrdersError("Couldn't load your orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.trim().length >= MIN_NAME_LENGTH_FOR_LOOKUP && !hasAutofilledRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        lookupAndAutofill();
      }, NAME_LOOKUP_DEBOUNCE_MS);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > MAX_ATTACHMENT_BYTES) {
      setSubmitError("Attachment must be 5MB or smaller.");
      e.target.value = ""; // clear the invalid selection
      setAttachment(null);
      return;
    }

    setSubmitError("");
    setAttachment(file);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setMobile("");
    setSelectedOrderId("");
    setIssueType("");
    setMessage("");
    setAttachment(null);
    setOrderOptions([]);
    hasAutofilledRef.current = false;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    const userId = getCurrentUserId();
    if (!userId) {
      setSubmitError("Please log in to submit a support request.");
      return;
    }

    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      setSubmitError(`Message must be at least ${MIN_MESSAGE_LENGTH} characters long.`);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // orderId goes in the POST body only.
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (mobile) formData.append("phone", mobile);
      formData.append("subject", issueType || "Support Request");
      formData.append("message", message);
      formData.append(
        "requestType",
        ISSUE_TYPE_TO_REQUEST_TYPE[issueType] || "other"
      );
      if (selectedOrderId) formData.append("orderId", selectedOrderId);
      if (attachment) formData.append("attachment", attachment);

      // userId goes as a query param only — not in the body.
      const res = await fetch(
        `${API_URL}/service-request/create-submit-request/${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Request failed");
      }

      setSubmitSuccess("Your support request has been submitted. We'll get back to you soon.");
      resetForm();
    } catch (err) {
      console.error("Failed to submit support request:", err);
      setSubmitError(err.message || "Could not submit your request right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
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
                <span>loganayagilavanya95@gmail.com</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <FaWhatsapp />
              </div>
              <div className="text">
                <h4>WhatsApp</h4>
                <span>+91 63793 49734</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <FaPhoneAlt />
              </div>
              <div className="text">
                <h4>Customer Care</h4>
                <span>Mon – Sat, 9:30 AM – 8:30 PM</span>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon">
                <IoLocationOutline />
              </div>
              <div className="text">
                <h4>Warehouse</h4>
                <span>9/335 Sai Garden, Reddipatty,<br />
                 Elampillai, Salem, Tamil Nadu</span>
              </div>
            </div>
          </div>



        </div>



        {/* RIGHT SIDE — FORM */}
        <div className="contact-right">
          <h2>Submit a Support Request</h2>

          {submitSuccess && (
            <p className="form-status form-success" style={{ color: "green" }}>
              {submitSuccess}
            </p>
          )}
          {submitError && (
            <p className="form-status form-error" style={{ color: "red" }}>
              {submitError}
            </p>
          )}

          <form className="form" onSubmit={handleSubmitRequest}>
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={handleNameChange}
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
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                >
                  <option value="">
                    {ordersLoading
                      ? "Loading your orders..."
                      : "Select an order (optional)"}
                  </option>
                  {orderOptions.map((opt, i) => (
                    <option key={`${opt.value}-${i}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {ordersError && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {ordersError}
                  </span>
                )}
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
              minLength={MIN_MESSAGE_LENGTH}
              required
            ></textarea>

            <button className="Con-btn" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"} <LuSend />
            </button>
          </form>
        </div>
      </div>

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