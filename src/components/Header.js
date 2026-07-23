import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Header.css";
import { HiMenu, HiX } from "react-icons/hi";
import { FiShoppingBag } from "react-icons/fi";
import wed from "../assets/hand-drawn-sari-illustration.png";

const Header = () => {
  const { getCartCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
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

  const navLinks = [
    { to: "/", label: "New Arrivals" },
    { to: "/product", label: "Shop Sarees" },
    { to: "/jew", label: "Jewellery" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Customer Support" },
  ];

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
            <Link to="/" className="logo-link">
              <span className="logo-text">Lavanya Trends</span>
              <span className="logo-subtext">Sarees Collection</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="sub-header">
            <nav className="nav">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Profile / Auth */}
            {user ? (
              <button className="profile pro" onClick={handleProfileClick} aria-label="Profile">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || "Profile"} className="profile-img" />
                ) : (
                  <span className="profile-initial">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </button>
            ) : (
              <button className="auth-link pro" onClick={handleProfileClick}>
                Sign In / Login
              </button>
            )}

            {/* Cart */}
            <button className="cart-button pro" onClick={toggleCart} aria-label="Cart">
              <FiShoppingBag size={24} className="cart-icon" />
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
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)}>
              My Profile
            </Link>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Sign In / Login
            </Link>
          )}

          <button className="cart-button" onClick={toggleCart}>
            <FiShoppingBag size={22} className="cart-icon" />
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;