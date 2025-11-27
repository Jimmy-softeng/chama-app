// src/pages/auth/VerifyEmail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

function VerifyEmail() {
  const { token } = useParams(); // URL: /verify-email/:token
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("No verification token provided.");
        return;
      }

      try {
        // Decode token safely (backend expects URL-encoded token)
        const res = await fetch(
          `http://127.0.0.1:5000/auth/verify-email/${encodeURIComponent(token)}`
        );

        const data = await res.json();

        if (res.ok) {
          setStatus(data.msg || "Email verified successfully!");
          // Redirect to login after 2s
          setTimeout(() => navigate("/auth"), 2000);
        } else {
          setStatus(data.msg || "Verification failed. Link may be expired.");
        }
      } catch (err) {
        setStatus("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        <p>{status}</p>
      </div>
    </div>
  );
}

export default VerifyEmail;
