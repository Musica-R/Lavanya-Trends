import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Loginpage.css";
import { handleLoginError, handleRegisterError } from "../Lottie/helper";
import loginImg from "../assets/logi.png";
import { PiFlowerLotusThin } from "react-icons/pi";

const API_URL = process.env.REACT_APP_API_URL;

const LOGIN_API = `${API_URL}/new/login`;
const REGISTER_API = `${API_URL}/new/register`;

/* ---------------- Inline icons (no extra deps) ---------------- */
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" />
  </svg>
);
const IconEye = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {off ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
        <path d="M9.5 5.2A11 11 0 0 1 12 5c6 0 9.5 6 9.5 6a13.8 13.8 0 0 1-3.2 3.9M6.6 6.6C4 8.3 2.5 11 2.5 11S6 17 12 17a10.6 10.6 0 0 0 3-.4" />
      </>
    ) : (
      <>
        <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/profile";

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setMobile("");
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(LOGIN_API, { email, password });

      if (!res.data?.success) {
        alert(res.data?.message || "Login failed. Please try again.");
        return;
      }

      const user = res.data.data;
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful 🎉");
      resetForm();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      alert(handleLoginError(error));
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return alert("Enter a valid 10-digit mobile number");
    }

    try {
      await axios.post(REGISTER_API, {
        name,
        email,
        password,
        phoneNo: mobile,
      });

      alert("Registered successfully! Please login 📩");
      setIsSignup(false);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          alert("This mobile number is already registered. Try using a different mobile number");
          resetForm();
          return;
        }
        alert("Registration failed. Please try again.");
        return;
      }

      alert(handleRegisterError(error));
      resetForm();
    }
  };

  return (
    <div className="lav-auth-page">
      {/* ---------------- LEFT: BRAND PANEL ---------------- */}
      <div className="lav-auth-left" style={{ backgroundImage: `url(${loginImg})` }}>
        <div className="lav-auth-left-overlay" />
      </div>

      {/* ---------------- RIGHT: FORM CARD ---------------- */}
      <div className="lav-auth-right">
        <div className="lav-login-card">
          <div className="lav-card-logo-row">
            <span className="lav-card-logo-line" />
            <span className="lav-card-logo-circle">
             <PiFlowerLotusThin className="lotus" />
            </span>
            <span className="lav-card-logo-line" />
          </div>

          {isSignup ? (
            <>
              <h3 className="lav-card-title">Create Account</h3>
              <p className="lav-card-subtitle">Join the Lavanya Trends family</p>

              <form onSubmit={handleSignup} className="lav-login-form">
                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconUser /></span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconPhone /></span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </label>

                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconMail /></span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="lav-input-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <IconEye off={showPassword} />
                  </button>
                </label>
               
                <button type="submit" className="lav-submit-btn">
                  <IconLock /> Sign Up
                </button>
              </form>
                <br />
              <p className="lav-login-toggle-text">
                Already have an account?{" "}
                <span onClick={() => setIsSignup(false)} className="lav-login-color">
                  Login
                </span>
              </p>
            </>
          ) : (
            <>
              <h3 className="lav-card-title">Welcome Back</h3>
              <p className="lav-card-subtitle">Login to continue your Lavanya Trends journey</p>

              <form onSubmit={handleLogin} className="lav-login-form">
                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconMail /></span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="lav-input-group">
                  <span className="lav-input-icon"><IconLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="lav-input-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <IconEye off={showPassword} />
                  </button>
                </label>

                <div className="lav-forgot-row">
                  <span className="lav-forgot-link">Forgot Password?</span>
                </div>

                <button type="submit" className="lav-submit-btn">
                  <IconLock /> Login
                </button>
              </form>
              <br />
              <p className="lav-login-toggle-text">
                Don&apos;t have an account?{" "}
                <span onClick={() => setIsSignup(true)} className="lav-login-color">
                  Sign Up
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;