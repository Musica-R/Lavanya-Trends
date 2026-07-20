import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Loginpage.css";
import { handleLoginError, handleRegisterError } from "../Lottie/helper";
import loginImg from "../assets/Login.png";
import signupImg from "../assets/signin.png";

const LOGIN_API = "https://nithi-billing.ddnsgeek.com/sarees/new/login";
const REGISTER_API = "https://nithi-billing.ddnsgeek.com/sarees/new/register";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/profile";

  const [isSignup, setIsSignup] = useState(false);
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
    <div className="lav-login-page">
      <div className="lav-login-card">
        {isSignup ? (
          <form onSubmit={handleSignup} className="lav-login-form">
            <img src={signupImg} alt="signup" width={300} height={200} className="lav-login-img" />
            <h3>Create Account</h3>

            <input type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)} required />

            <input type="tel" placeholder="Mobile Number" maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              required />

            <input type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)} required />

            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit">Sign Up</button>

            <p className="lav-login-toggle-text">
              Already have an account?
              <span onClick={() => setIsSignup(false)} className="lav-login-color">
                &nbsp;Login
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="lav-login-form">
            <img src={loginImg} alt="login" width={300} height={180} className="lav-login-img" />
            <h3>Login</h3>

            <input type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)} required />

            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit">Login</button>

            <p className="lav-login-toggle-text">
              Don&apos;t have an account?
              <span onClick={() => setIsSignup(true)} className="lav-login-color">
                &nbsp;Sign Up
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;