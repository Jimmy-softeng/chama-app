import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/shares.css";
import { API_BASE } from "../../config";


function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Shares() {
  const [shares, setShares] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/auth");
  }, [navigate]);

  const fetchShares = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/shares`, {
        headers: getAuthHeader(),
      });
      setShares(res.data.shares || null);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAuthError();
      } else if (err.response?.status === 404) {
        setShares(null);
      } else {
        setError(err.response?.data?.msg || "Failed to load shares");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  return (
    <div className="shares-page">
      <h2>My Shares</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {shares ? (
        <div className="shares-table-container">
          <table className="shares-table">
            <thead>
              <tr>
                <th>Shares</th>
                <th>Dividends</th>
                <th>Penalties</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{shares.shares}</td>
                <td>{shares.dividends}</td>
                <td>{shares.penalties}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No shares record found. Please contact an admin.</p>
      )}
    </div>
  );
}
