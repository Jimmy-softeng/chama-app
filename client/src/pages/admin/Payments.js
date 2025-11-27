// client/src/pages/Admin/Payments.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/payment.css";

const API_BASE = "http://127.0.0.1:5000";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/payments/all`, {
        headers: getAuthHeader(),
      });
      setPayments(res.data.payments || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await axios.delete(`${API_BASE}/payments/${paymentId}`, {
        headers: getAuthHeader(),
      });
      setPayments(payments.filter((p) => p.paymentId !== paymentId));
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete payment");
      console.error(err);
    }
  };

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="payments-container">
      <h2>All Payments</h2>
      {error && <p className="error-text">{error}</p>}
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Firstname</th>
              <th>Payment Name</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentId}>
                <td>{p.memberId}</td>
                <td>{p.firstname}</td>
                <td>{p.payname}</td>
                <td>{p.amount}</td>
                <td>{p.method}</td>
                <td>{p.receipt}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(p.paymentId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Payments;
