// components/FloatingButtons.jsx
import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import "../styles/FloatingButtons.css";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsappNumber = "916379349734"; // country code + number, no + or spaces
  const whatsappMessage = "Hi, I'd like to know more about your products.";

  return (
    <div className="fb-container">
      {showScrollTop && (
        <button
          className="fb-scroll-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <IoIosArrowUp />
        </button>
      )}

      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fb-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}