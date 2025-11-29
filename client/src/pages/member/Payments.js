// client/src/pages/Member/Payments.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/payments.css";
import { API_BASE } from "../../config";


function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    payname: "",
    amount: "",
    method: "",
    receipt: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/auth");
  }, [navigate]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_BASE}/payments/me`, { headers });
      setPayments(res.data.payments || []);
    } catch (err) {
      if (err.response?.status === 401) handleAuthError();
      else setError(err.response?.data?.msg || "Error fetching payments");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!formData.payname || !formData.amount || !formData.method || !formData.receipt) {
      setError("Please fill all fields");
      return;
    }

    const payload = {
      payname: formData.payname,
      amount: parseFloat(formData.amount),
      method: formData.method,
      receipt: formData.receipt
    };

    if (Number.isNaN(payload.amount) || payload.amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    try {
      const headers = { ...getAuthHeader(), "Content-Type": "application/json" };
      const res = await axios.post(`${API_BASE}/payments`, payload, { headers });
      setSuccess(res.data.msg || "Payment successful");
      setFormData({ payname: "", amount: "", method: "", receipt: "" });
      fetchPayments();
    } catch (err) {
      if (err.response?.status === 401) handleAuthError();
      else setError(err.response?.data?.msg || "Error making payment");
    }
  };

  return (
    <div className="payments-container">
      <h2>My Payments</h2>

      <form className="payment-form" onSubmit={handleSubmit}>
        <input type="text" name="payname" placeholder="Payment Name" value={formData.payname} onChange={handleChange} required />
        <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
        <input type="text" name="method" placeholder="Payment Method" value={formData.method} onChange={handleChange} required />
        <input type="text" name="receipt" placeholder="Receipt Number" value={formData.receipt} onChange={handleChange} required />
        <button type="submit">Make Payment</button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="payments-list">
        <h3>Payment History</h3>
        {loading ? <p>Loading...</p> : payments.length === 0 ? <p>No payments found</p> :
          <table>
            <thead>
              <tr>
                <th>Payment Name</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId ?? p.id ?? p.receipt}>
                  <td>{p.payname}</td>
                  <td>{p.amount}</td>
                  <td>{p.method}</td>
                  <td>{p.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
}
