import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProfilePage.css";

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

  return (
    <div className="lav-profile-page">
      <aside className="lav-profile-sidebar">
        <div className="lav-profile-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <h3 className="lav-profile-name">{user.name}</h3>
        <p className="lav-profile-email">{user.email}</p>

        <nav className="lav-profile-nav">
          <button
            className={`lav-profile-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
          <button
            className={`lav-profile-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            My Bookings
          </button>
          <button className="lav-profile-nav-item lav-profile-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="lav-profile-content">
        {activeTab === "profile" && (
          <section className="lav-profile-card">
            <h2>My Profile</h2>
            <div className="lav-profile-field">
              <span className="lav-profile-label">Name</span>
              <span className="lav-profile-value">{user.name}</span>
            </div>
            <div className="lav-profile-field">
              <span className="lav-profile-label">Email</span>
              <span className="lav-profile-value">{user.email}</span>
            </div>
            {user.phoneNo && (
              <div className="lav-profile-field">
                <span className="lav-profile-label">Mobile</span>
                <span className="lav-profile-value">{user.phoneNo}</span>
              </div>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="lav-profile-card">
            <h2>My Bookings</h2>

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
      </main>
    </div>
  );
};

export default ProfilePage;