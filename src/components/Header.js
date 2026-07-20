import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Header.css";
import { CgProfile } from "react-icons/cg";
import { HiMenu, HiX } from "react-icons/hi";
import wed from "../assets/hand-drawn-sari-illustration.png";

const Header = () => {
  const { getCartCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <header className="header">
        {/* Sale Offer Bar */}
        <div className="sale-bar">
          <div className="sale-bar-track">
            <span className="sale-bar-text">
              ✨ Festive Sale — Flat 30% OFF on all Sarees | Free Shipping over ₹2999 | Use code LAVANYA30 ✨
            </span>
            <span className="sale-bar-text" aria-hidden="true">
              ✨ Festive Sale — Flat 30% OFF on all Sarees | Free Shipping over ₹2999 | Use code LAVANYA30 ✨
            </span>
          </div>
        </div>

        <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <img src={wed} alt="Wedding Sarees" width={50} height={50} className="emoji" />
            <Link to="/"><span className="logo-text">Lavanya Trends</span></Link>
          </div>

          {/* Desktop Nav */}
          <div className="sub-header">
            <nav className="nav">
              <Link to="/" className="nav-link">New Arrivals</Link>
              <Link to="/product" className="nav-link">Sarees</Link>
              <Link to="/jew" className="nav-link">Jewellery</Link>
              <Link to="/contact" className="nav-link">Customer Support</Link>
            </nav>

            {/* Profile */}
            <button className="profile pro" onClick={handleProfileClick} aria-label="Profile">
              <CgProfile size={32} />
            </button>

            {/* Cart */}
            <button className="cart-button pro" onClick={toggleCart}>
              <span className="cart-icon">🛒</span>
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>

            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>New Arrivals</Link>
          <Link to="/product" onClick={() => setMenuOpen(false)}>Sarees</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Customer Support</Link>

          <button className="cart-button" onClick={toggleCart}>
            <span className="cart-icon">🛒</span>
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;