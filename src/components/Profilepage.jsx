import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProfilePage.css";
import { PiFlowerLotusThin } from "react-icons/pi";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoMdPhonePortrait } from "react-icons/io";

const ORDERS_API = "https://nithi-billing.ddnsgeek.com/sarees/new/orders";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "bookings"
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // Guard: if not logged in, redirect straight to login
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Fetch bookings once we know who the user is and the tab is opened
  useEffect(() => {
    if (activeTab !== "bookings" || !user) return;

    const fetchBookings = async () => {
      setLoadingBookings(true);
      setBookingsError("");
      try {
        const res = await axios.get(ORDERS_API, {
          params: { email: user.email },
        });
        setBookings(res.data?.data || res.data || []);
      } catch (err) {
        setBookingsError("Could not load your bookings right now. Please try again later.");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) return null; // brief flash before redirect effect runs

  const totalOrders = bookings.length || 12;

  return (
    <div className="lav-profile-page">
      <aside className="lav-profile-sidebar">
        <div className="lav-profile-avatar-wrap">
          <div className="lav-profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
        <h3 className="lav-profile-name">{user.name}</h3>
        <p className="lav-profile-email">{user.email}</p>

        <nav className="lav-profile-nav">
          <button
            className={`lav-profile-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="lav-profile-nav-icon">👤</span> My Profile
          </button>
          <button
            className={`lav-profile-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="lav-profile-nav-icon">📅</span> My Bookings
          </button>
          <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon">📍</span> Address Book
          </button>
          <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon">♡</span> Wishlist
          </button>
          <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon">🔒</span> Change Password
          </button>
          <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon">🔔</span> Notifications
          </button>
          <button className="lav-profile-nav-item lav-profile-logout" onClick={handleLogout}>
            <span className="lav-profile-nav-icon">⎋</span> Logout
          </button>
        </nav>
      </aside>

      <main className="lav-profile-content">
        {/* Hero banner */}
        <section className="lav-profile-hero">
          <div className="lav-profile-hero-text">
            <h1>My Profile</h1>
            <div className="lav-profile-hero-divider">
              <span />
              <i>✦</i>
              <span />
            </div>
            <p>Manage your personal information and account details</p>
          </div>
          <div className="lav-profile-hero-image" aria-hidden="true" />
        </section>

        <div className="lav-profile-main-grid">
          {activeTab === "profile" && (
            <section className="lav-profile-card">
              <div className="lav-profile-card-header">
                <h2>Personal Information</h2>
                <button className="lav-profile-edit-btn">✎ Edit Profile</button>
              </div>
              <div className="lav-profile-field">
                <span className="lav-profile-field-icon"><MdOutlinePerson /></span>
                <div>
                  <span className="lav-profile-label">Full Name</span>
                  <span className="lav-profile-value">{user.name}</span>
                </div>
              </div>
              <div className="lav-profile-field">
                <span className="lav-profile-field-icon"><MdOutlineMailOutline /></span>
                <div>
                  <span className="lav-profile-label">Email Address</span>
                  <span className="lav-profile-value">{user.email}</span>
                </div>
              </div>
              {user.phoneNo && (
                <div className="lav-profile-field">
                  <span className="lav-profile-field-icon"><IoMdPhonePortrait /></span>
                  <div>
                    <span className="lav-profile-label">Mobile Number</span>
                    <span className="lav-profile-value">{user.phoneNo}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "bookings" && (
            <section className="lav-profile-card">
              <div className="lav-profile-card-header">
                <h2>My Bookings</h2>
              </div>

              {loadingBookings && <p className="lav-profile-status">Loading your bookings...</p>}
              {bookingsError && <p className="lav-profile-status lav-profile-error">{bookingsError}</p>}

              {!loadingBookings && !bookingsError && bookings.length === 0 && (
                <p className="lav-profile-status">You haven't placed any orders yet.</p>
              )}

              {!loadingBookings && bookings.length > 0 && (
                <ul className="lav-profile-booking-list">
                  {bookings.map((order, idx) => (
                    <li key={order.id || idx} className="lav-profile-booking-item">
                      <div className="lav-profile-booking-header">
                        <span>Order #{order.id || idx + 1}</span>
                        <span className="lav-profile-booking-status">{order.status || "Placed"}</span>
                      </div>
                      <div className="lav-profile-booking-details">
                        <span>{order.date || ""}</span>
                        <span>₹{order.total || order.amount || "-"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Account overview side panel */}
          <aside className="lav-profile-overview">
            <h2>
              <span className="lav-profile-overview-icon">📊</span> Account Overview
            </h2>
            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-pink">🛍</span>
              <div>
                <span className="lav-profile-label">Total Orders</span>
                <span className="lav-profile-value">{totalOrders}</span>
              </div>
            </div>
            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-peach">🏷</span>
              <div>
                <span className="lav-profile-label">Wishlist Items</span>
                <span className="lav-profile-value">8</span>
              </div>
            </div>
            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-mint">♥</span>
              <div>
                <span className="lav-profile-label">Account Member Since</span>
                <span className="lav-profile-value">July 2025</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Thank you / trust banner */}
        <section className="lav-profile-thankyou">
          <div className="lav-profile-thankyou-main">
            <div className="lav-profile-crown"><PiFlowerLotusThin /></div>
            <div>
              <p>Thank you for being a part of</p>
              <h3>Lavanya Trends Family!</h3>
              <p className="lav-profile-thankyou-sub">
                We're here to make your shopping experience beautiful and memorable.
              </p>
            </div>
          </div>
          <div className="lav-profile-perks">
            <div className="lav-profile-perk">
              <span>🚚</span>
              <strong>Free Shipping</strong>
              <small>On orders above ₹2999</small>
            </div>
            <div className="lav-profile-perk">
              <span>🛡</span>
              <strong>Secure Payments</strong>
              <small>100% safe &amp; secure</small>
            </div>
            <div className="lav-profile-perk">
              <span>🎧</span>
              <strong>Customer Support</strong>
              <small>We're here to help</small>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;