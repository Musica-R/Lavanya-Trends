import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProfilePage.css";
import { PiFlowerLotusThin } from "react-icons/pi";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoMdPhonePortrait } from "react-icons/io";
import { MdOutlineCalendarToday } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { MdOutlineFavorite } from "react-icons/md";
import { MdOutlineLock } from "react-icons/md";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import { MdOutlineBarChart } from "react-icons/md";
import { MdOutlineShoppingBag } from "react-icons/md";
import { MdOutlineLocalOffer } from "react-icons/md";
import { MdOutlineLocalShipping } from "react-icons/md";
import { MdOutlineSecurity } from "react-icons/md";
import { MdOutlineSupportAgent } from "react-icons/md";
import { MdOutlineReportProblem } from "react-icons/md";
import { MdClose } from "react-icons/md";

const BASE_API = "https://mediumorchid-rhinoceros-818505.hostingersite.com";
const ORDERS_API = `${BASE_API}/orders/get-user-order`;
const UPDATE_CUSTOMER_API = `${BASE_API}/users/update-customer`;
const PROFILE_STATS_API = `${BASE_API}/users/profile-stats`;
const FAVORITES_API = `${BASE_API}/favourites/my-favorites`;
const SERVICE_REQUESTS_API = `${BASE_API}/service-request/reqeust-by-id`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "bookings" | "wishlist" | "issues"
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // Account overview stats (Total Orders, Wishlist count, Member since)
  // pulled from /users/profile-stats/:userId.
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  // Wishlist tab data, pulled from /favourites/my-favorites?userId=.
  // Holds the raw favorite rows (each has a nested `product`), across
  // both sarees and jewelry since the endpoint returns both.
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");

  // Issue Reports tab data, pulled from /service-request/reqeust-by-id/:userId.
  // Each row is a support/complaint ticket, optionally tied to an order.
  const [issueReports, setIssueReports] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState("");

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Guard: if not logged in, redirect straight to login
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setForm({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phoneNo || parsed.phone || "",
        address: parsed.address || "",
        state: parsed.state || "",
        city: parsed.city || "",
        pincode: parsed.pincode || "",
      });
    } catch {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // The order/customer response keys the user by "id" (see user.id / customer.userId
  // in the API payload), so that's the field pulled from whatever's in localStorage.
  const getUserId = (u) => u?.id || u?.userId || u?._id;

  // Fetch account-overview stats (total orders, wishlist count, member
  // since) as soon as we know who the user is — this powers the side
  // panel regardless of which tab is active.
  useEffect(() => {
    if (!user) return;

    const userId = getUserId(user);
    if (!userId) return;

    const fetchStats = async () => {
      setStatsError("");
      try {
        const res = await axios.get(`${PROFILE_STATS_API}/${userId}`);
        setStats(res.data?.data || null);
      } catch (err) {
        setStatsError("Could not load account overview.");
      }
    };

    fetchStats();
  }, [user]);

  // Fetch bookings once we know who the user is and the tab is opened
  useEffect(() => {
    if (activeTab !== "bookings" || !user) return;

    const userId = getUserId(user);
    if (!userId) {
      setBookingsError("Could not identify your account. Please log in again.");
      return;
    }

    const fetchBookings = async () => {
      setLoadingBookings(true);
      setBookingsError("");
      try {
        const res = await axios.get(`${ORDERS_API}/${userId}`);
        // Real response shape: { success, userId, orders: [...], currentPage, totalPages, total }
        setBookings(res.data?.orders || []);
      } catch (err) {
        setBookingsError("Could not load your bookings right now. Please try again later.");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [activeTab, user]);

  // Fetch wishlist (favorites) once the Wishlist tab is opened. Each
  // row includes a nested `product` object already, so no extra
  // product lookups are needed.
  useEffect(() => {
    if (activeTab !== "wishlist" || !user) return;

    const userId = getUserId(user);
    if (!userId) {
      setFavoritesError("Could not identify your account. Please log in again.");
      return;
    }

    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      setFavoritesError("");
      try {
        const res = await axios.get(`${FAVORITES_API}?userId=${userId}`);
        setFavorites(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        setFavoritesError("Could not load your wishlist right now. Please try again later.");
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [activeTab, user]);

  // Fetch issue reports (support/complaint tickets) once the Issue
  // Reports tab is opened. Each row may optionally include a nested
  // `order` object when the request is tied to a specific order.
  useEffect(() => {
    if (activeTab !== "issues" || !user) return;

    const userId = getUserId(user);
    if (!userId) {
      setIssuesError("Could not identify your account. Please log in again.");
      return;
    }

    const fetchIssues = async () => {
      setLoadingIssues(true);
      setIssuesError("");
      try {
        const res = await axios.get(`${SERVICE_REQUESTS_API}/${userId}`);
        setIssueReports(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        setIssuesError("Could not load your issue reports right now. Please try again later.");
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchIssues();
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = () => {
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    const userId = getUserId(user);
    if (!userId) {
      setSaveError("Could not identify your account. Please log in again.");
      return;
    }

    setSavingProfile(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        userId,
      };

      const res = await axios.post(`${UPDATE_CUSTOMER_API}/${userId}`, payload);
      const updatedUser = { ...user, ...(res.data?.data || res.data || payload) };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSaveSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setSaveError("Could not update your profile right now. Please try again later.");
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  // Member-since display wants "Month Year" (e.g. "July 2026"), a bit
  // shorter than the full day/month/year format used for bookings.
  const formatMonthYear = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const imageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BASE_API}${path}`;
  };

  // Some service-request rows come back with stray quotes/trailing
  // commas baked into string fields (e.g. `"Vishnu Varatharaj",`).
  // This only cleans up how it's displayed — it doesn't touch the data.
  const cleanText = (value) => {
    if (typeof value !== "string") return value;
    return value.replace(/^"+|"+$/g, "").replace(/,+$/, "").trim();
  };

  // Turns "in_progress" into "In Progress" for status/priority display.
  const formatStatus = (value) => {
    if (!value) return "Pending";
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!user) return null; // brief flash before redirect effect runs

  // Prefer live stats from the API; fall back to fetched bookings
  // length, then 0, if stats haven't loaded yet.
  const totalOrders = stats?.totalOrders ?? bookings.length ?? 0;
  const wishlistCount = stats?.likesCount ?? favorites.length ?? 0;
  const memberSince = formatMonthYear(stats?.dateOfJoining);

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
            <span className="lav-profile-nav-icon"><MdOutlinePerson /></span> My Profile
          </button>
          <button
            className={`lav-profile-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="lav-profile-nav-icon"><MdOutlineCalendarToday /></span> My Bookings
          </button>
          <button
            className={`lav-profile-nav-item ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            <span className="lav-profile-nav-icon"><MdOutlineFavoriteBorder /></span> Wishlist
          </button>
          <button
            className={`lav-profile-nav-item ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            <span className="lav-profile-nav-icon"><MdOutlineReportProblem /></span> Issue Reports
          </button>
          {/* <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon"><MdOutlineLock /></span> Change Password
          </button> */}
          {/* <button className="lav-profile-nav-item" disabled>
            <span className="lav-profile-nav-icon"><MdOutlineNotificationsNone /></span> Notifications
          </button> */}
          <button className="lav-profile-nav-item lav-profile-logout" onClick={handleLogout}>
            <span className="lav-profile-nav-icon"><MdOutlineLogout /></span> Logout
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
                <button className="lav-profile-edit-btn" onClick={openEdit}>
                  ✎ Edit Profile
                </button>
              </div>

              {saveSuccess && (
                <p className="lav-profile-status lav-profile-success">{saveSuccess}</p>
              )}

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
              {(user.phoneNo || user.phone) && (
                <div className="lav-profile-field">
                  <span className="lav-profile-field-icon"><IoMdPhonePortrait /></span>
                  <div>
                    <span className="lav-profile-label">Mobile Number</span>
                    <span className="lav-profile-value">{user.phoneNo || user.phone}</span>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="lav-profile-field">
                  <span className="lav-profile-field-icon"><MdOutlineLocationOn /></span>
                  <div>
                    <span className="lav-profile-label">Address</span>
                    <span className="lav-profile-value">
                      {[user.address, user.city, user.state, user.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
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
                  {bookings.map((order) => (
                    <li key={order.id} className="lav-profile-booking-item">
                      <div className="lav-profile-booking-header">
                        <span>{order.orderNumber || `Order #${order.id}`}</span>
                        <span className="lav-profile-booking-status">{order.status || "Placed"}</span>
                      </div>

                      <div className="lav-profile-booking-items">
                        {(order.items || []).map((item) => (
                          <div key={item.id} className="lav-profile-booking-line">
                            {item.image_url && (
                              <img
                                className="lav-profile-booking-thumb"
                                src={imageUrl(item.image_url)}
                                alt={item.productName}
                              />
                            )}
                            <div className="lav-profile-booking-line-info">
                              <span className="lav-profile-booking-line-name">
                                {item.productName}
                              </span>
                              <span className="lav-profile-booking-line-meta">
                                {[item.color, item.size, item.fabric].filter(Boolean).join(" · ")}
                                {item.quantity ? ` · Qty ${item.quantity}` : ""}
                              </span>
                            </div>
                            <span className="lav-profile-booking-line-price">
                              ₹{item.subtotal || item.price || "-"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="lav-profile-booking-shipto">
                        Shipping to: {[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingPincode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>

                      <div className="lav-profile-booking-details">
                        <span>{formatDate(order.createdAt)}</span>
                        <span>Total: ₹{order.grandTotal || order.subtotal || "-"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "wishlist" && (
            <section className="lav-profile-card">
              <div className="lav-profile-card-header">
                <h2>My Wishlist</h2>
              </div>

              {loadingFavorites && <p className="lav-profile-status">Loading your wishlist...</p>}
              {favoritesError && (
                <p className="lav-profile-status lav-profile-error">{favoritesError}</p>
              )}

              {!loadingFavorites && !favoritesError && favorites.length === 0 && (
                <p className="lav-profile-status">You haven't favorited anything yet.</p>
              )}

              {!loadingFavorites && favorites.length > 0 && (
                <ul className="lav-profile-booking-list">
                  {favorites.map((fav) => {
                    const product = fav.product || {};
                    const isJewel = fav.productType?.toUpperCase() === "JEWEL";
                    return (
                      <li
                        key={fav.id}
                        className="lav-profile-booking-item"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(
                            isJewel ? `/jewelry/${product.id}` : `/product/${product.id}`,
                            { state: { product } }
                          )
                        }
                      >
                        <div className="lav-profile-booking-line">
                          {product.image_url && (
                            <img
                              className="lav-profile-booking-thumb"
                              src={imageUrl(product.image_url)}
                              alt={product.name}
                            />
                          )}
                          <div className="lav-profile-booking-line-info">
                            <span className="lav-profile-booking-line-name">
                              {product.name}
                            </span>
                            <span className="lav-profile-booking-line-meta">
                              {fav.productType} · Added {formatDate(fav.createdAt)}
                            </span>
                          </div>
                          <span className="lav-profile-booking-line-price">
                            ₹{product.offerPrice || product.price || "-"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {activeTab === "issues" && (
            <section className="lav-profile-card">
              <div className="lav-profile-card-header">
                <h2>Issue Reports</h2>
              </div>

              {loadingIssues && <p className="lav-profile-status">Loading your issue reports...</p>}
              {issuesError && (
                <p className="lav-profile-status lav-profile-error">{issuesError}</p>
              )}

              {!loadingIssues && !issuesError && issueReports.length === 0 && (
                <p className="lav-profile-status">You haven't raised any issue reports yet.</p>
              )}

              {!loadingIssues && issueReports.length > 0 && (
                <ul className="lav-profile-booking-list">
                  {issueReports.map((report) => (
                    <li key={report.id} className="lav-profile-booking-item">
                      <div className="lav-profile-booking-header">
                        <span>{cleanText(report.subject) || "Support Request"}</span>
                        <span
                          className={`lav-profile-issue-status lav-issue-${(report.status || "pending").toLowerCase()}`}
                        >
                          {formatStatus(report.status)}
                        </span>
                      </div>

                      {report.message && (
                        <p className="lav-profile-issue-message">{cleanText(report.message)}</p>
                      )}

                      {report.order && (
                        <div className="lav-profile-issue-order">
                          <span className="lav-profile-issue-order-label">
                            Related order: {report.order.orderNumber || `#${report.order.id}`}
                          </span>
                          {(report.order.items || []).map((item, idx) => (
                            <div key={idx} className="lav-profile-booking-line">
                              <div className="lav-profile-booking-line-info">
                                <span className="lav-profile-booking-line-name">
                                  {item.productName}
                                </span>
                                <span className="lav-profile-booking-line-meta">
                                  {[item.color, item.size].filter(Boolean).join(" · ")}
                                  {item.quantity ? ` · Qty ${item.quantity}` : ""}
                                </span>
                              </div>
                              <span className="lav-profile-booking-line-price">
                                ₹{item.price || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="lav-profile-booking-details">
                        <span>{formatDate(report.createdAt)}</span>
                        <span>Priority: {formatStatus(report.priority)}</span>
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
              <span className="lav-profile-overview-icon lav-icon-plain"><MdOutlineBarChart /></span> Account Overview
            </h2>

            {statsError && <p className="lav-profile-status lav-profile-error">{statsError}</p>}

            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-pink"><MdOutlineShoppingBag /></span>
              <div>
                <span className="lav-profile-label">Total Orders</span>
                <span className="lav-profile-value">{totalOrders}</span>
              </div>
            </div>
            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-peach"><MdOutlineLocalOffer /></span>
              <div>
                <span className="lav-profile-label">Wishlist Items</span>
                <span className="lav-profile-value">{wishlistCount}</span>
              </div>
            </div>
            <div className="lav-profile-overview-item">
              <span className="lav-profile-overview-icon lav-icon-mint"><MdOutlineFavorite /></span>
              <div>
                <span className="lav-profile-label">Account Member Since</span>
                <span className="lav-profile-value">{memberSince}</span>
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
              <span><MdOutlineLocalShipping /></span>
              <strong>Free Shipping</strong>
              <small>On orders above ₹2999</small>
            </div>
            <div className="lav-profile-perk">
              <span><MdOutlineSecurity /></span>
              <strong>Secure Payments</strong>
              <small>100% safe &amp; secure</small>
            </div>
            <div className="lav-profile-perk">
              <span><MdOutlineSupportAgent /></span>
              <strong>Customer Support</strong>
              <small>We're here to help</small>
            </div>
          </div>
        </section>
      </main>

      {/* Edit Profile modal */}
      {isEditing && (
        <div className="lav-profile-modal-overlay" onClick={closeEdit}>
          <div className="lav-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lav-profile-modal-header">
              <h2>Edit Profile</h2>
              <button className="lav-profile-modal-close" onClick={closeEdit}>
                <MdClose />
              </button>
            </div>

            {saveError && <p className="lav-profile-status lav-profile-error">{saveError}</p>}

            <div className="lav-profile-form-grid">
              <div className="lav-profile-form-field">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} />
              </div>
              {/* <div className="lav-profile-form-field">
                <label>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleFormChange} />
              </div> */}
              <div className="lav-profile-form-field">
                <label>Mobile Number</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} />
              </div>
              <div className="lav-profile-form-field lav-profile-form-field-full">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleFormChange} />
              </div>
              <div className="lav-profile-form-field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleFormChange} />
              </div>
              <div className="lav-profile-form-field">
                <label>State</label>
                <input name="state" value={form.state} onChange={handleFormChange} />
              </div>
              <div className="lav-profile-form-field">
                <label>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleFormChange} />
              </div>
            </div>

            <div className="lav-profile-modal-actions">
              <button className="lav-profile-cancel-btn" onClick={closeEdit} disabled={savingProfile}>
                Cancel
              </button>
              <button className="lav-profile-save-btn" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;