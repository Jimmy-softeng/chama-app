// client/src/pages/auth/ResetPassword.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/resetpassword.css";
import resetImage from "../../assets/images/reset.png";
import { API_BASE } from "../../config";


export default function ResetPassword() {
  // Try params first (works for /reset-password/:token)
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // If route is /reset-password/*, params.token may be undefined.
  // Fallback: take everything after '/reset-password/' from location.pathname
  const rawTokenFromParams = params.token;
  const fallbackPathToken = (() => {
    const prefix = "/reset-password/";
    if (location && location.pathname && location.pathname.startsWith(prefix)) {
      return location.pathname.slice(prefix.length);
    }
    return null;
  })();

  // Choose token candidate and decode it safely
  const tokenCandidate = rawTokenFromParams || fallbackPathToken;
  const decodedToken = tokenCandidate ? decodeURIComponent(tokenCandidate) : null;

  // debug logging — REMOVE in production or when fixed
  useEffect(() => {
    console.info("ResetPassword mounted. location.pathname=", location.pathname);
    console.info("params.token=", rawTokenFromParams);
    console.info("fallbackPathToken=", fallbackPathToken);
    console.info("decodedToken=", decodedToken);
  }, [location.pathname, rawTokenFromParams, fallbackPathToken, decodedToken]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // optionally normalize URL in history so back button doesn't resubmit token
  useEffect(() => {
    if (decodedToken) {
      try {
        window.history.replaceState(null, "", `/reset-password/${encodeURIComponent(tokenCandidate)}`);
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedToken]);

  // Request a reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) return setError("Please enter your email.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(data.msg || "If that email exists, a reset link was sent.");
      else setError(data.msg || "Failed to request reset link.");
    } catch (err) {
      console.error("request-reset error:", err);
      setError("Something went wrong. Try later.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password with decoded token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!decodedToken) return setError("Missing or invalid reset token.");
    if (!password) return setError("Enter a new password.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: decodedToken, new_password: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.msg || "Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/auth", { replace: true }), 1500);
      } else {
        setError(data.msg || "Failed to reset password.");
      }
    } catch (err) {
      console.error("reset-password error:", err);
      setError("Something went wrong. Try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-box">
        <div className="reset-image-container">
          <img src={resetImage} alt="Reset illustration" className="reset-image" />
        </div>

        <div className="reset-form-container">
          <h2>{decodedToken ? "Set a New Password" : "Forgot Password?"}</h2>

          {!decodedToken ? (
            <form onSubmit={handleRequestReset} className="reset-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="reset-form">
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {success && <p className="reset-success">{success}</p>}
          {error && <p className="reset-error">{error}</p>}

          <button
            className="auth-button back-button"
            onClick={() => navigate("/auth", { replace: true })}
            style={{ marginTop: 12 }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
