// client/src/pages/Auth/AuthPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authImage from "../../assets/images/reg.png";
import "../../styles/auth.css";

const API_BASE = "http://127.0.0.1:5000";

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneno: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ firstname: "", lastname: "", email: "", phoneno: "", password: "" });
    setError("");
    setInfo("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      if (isRegistering) {
        // Register new user (default role = member on server)
        const res = await axios.post(`${API_BASE}/auth/register`, {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phoneno: formData.phoneno,
          password: formData.password,
        });

        if (res.status === 201) {
          setInfo(res.data.msg || "Registered. Please check your email to verify before logging in.");
          // switch to login mode after short delay
          setTimeout(() => setIsRegistering(false), 1400);
        } else {
          setError(res.data.msg || "Registration failed");
        }
        return;
      }

      // LOGIN
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // token returned from login
      const token = res.data?.access_token;
      if (!token) {
        setError("Login succeeded but server did not return a token.");
        return;
      }

      // store token immediately
      localStorage.setItem("token", token);

      // fetch authoritative profile to check role and verification
      const meRes = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = meRes.data?.user;
      if (!user) {
        // cleanup token if we couldn't fetch profile
        localStorage.removeItem("token");
        setError("Could not fetch user profile after login. Try again.");
        return;
      }

      // Block unverified users
      if (user.email_verified === false || user.email_verified === "false") {
        // remove token and instruct user
        localStorage.removeItem("token");
        setError(
          "Your email is not verified. Please check your inbox and click the verification link before logging in."
        );
        return;
      }

      // persist user object for later admin actions and UI
      localStorage.setItem("user", JSON.stringify(user));
      // optional small flag some guards use
      localStorage.setItem("isAuthenticated", "1");

      const role = (user.role || "").toString().toLowerCase();

      if (role === "admin") {
        navigate("/admin");
      } else {
        // any non-admin goes to member dashboard
        navigate("/member");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.msg || err.message || "Something went wrong";
      setError(msg);

      // remove token on auth errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        {/* Left side: image */}
        <div className="auth-image-container">
          <img src={authImage} alt="Authentication" />
        </div>

        {/* Right side: form */}
        <div className="auth-form-container">
          <h2>{isRegistering ? "Register" : "Login"}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <input
                  type="text"
                  name="firstname"
                  placeholder="Firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phoneno"
                  placeholder="Phone Number"
                  value={formData.phoneno}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit">{isRegistering ? "Register" : "Login"}</button>
          </form>

          {info && <p className="auth-info">{info}</p>}
          {error && <p className="auth-error">{error}</p>}

          <p className="auth-toggle-text">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={toggleMode} className="auth-toggle-btn">
              {isRegistering ? "Login" : "Register"}
            </button>
          </p>

          {!isRegistering && (
            <p className="forgot-password" onClick={() => navigate("/reset-password")}>
              Forgot Password?
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
