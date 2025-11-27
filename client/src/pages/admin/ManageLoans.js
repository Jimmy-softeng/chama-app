import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manageLoans.css";

const API_BASE = "http://localhost:5000";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ManageLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    interest: "",
    year: "",
    monthrepay: "",
  });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/loans`, {
        headers: getAuthHeader(),
      });
      setLoans(res.data.loans || []);
    } catch (err) {
      console.error("Error fetching loans:", err);
      alert("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const startEdit = (loan) => {
    setEditingLoanId(loan.memberId);
    setFormData({
      amount: loan.amount,
      interest: loan.interest,
      year: loan.year,
      monthrepay: loan.monthrepay,
    });
  };

  const cancelEdit = () => {
    setEditingLoanId(null);
    setFormData({ amount: "", interest: "", year: "", monthrepay: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (memberId) => {
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        interest: parseFloat(formData.interest),
        year: parseInt(formData.year),
        monthrepay: parseFloat(formData.monthrepay),
      };
      await axios.put(`${API_BASE}/loans/${memberId}`, payload, {
        headers: getAuthHeader(),
      });

      setLoans(
        loans.map((loan) =>
          loan.memberId === memberId
            ? { ...loan, ...payload }
            : loan
        )
      );
      cancelEdit();
    } catch (err) {
      console.error("Error updating loan:", err);
      alert("Failed to update loan");
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;

    try {
      await axios.delete(`${API_BASE}/loans/${memberId}`, {
        headers: getAuthHeader(),
      });
      setLoans(loans.filter((loan) => loan.memberId !== memberId));
    } catch (err) {
      console.error("Error deleting loan:", err);
      alert("Failed to delete loan");
    }
  };

  if (loading) return <p>Loading loans...</p>;

  return (
    <div className="manage-loans">
      <h2>Manage Loans</h2>
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Member ID</th>
              <th>First Name</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Year</th>
              <th>Monthly Repayment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.memberId}>
                <td>{loan.memberId}</td>
                <td>{loan.firstname}</td>
                <td>
                  {editingLoanId === loan.memberId ? (
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  ) : (
                    loan.amount
                  )}
                </td>
                <td>
                  {editingLoanId === loan.memberId ? (
                    <input
                      type="number"
                      step="0.01"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                    />
                  ) : (
                    loan.interest
                  )}
                </td>
                <td>
                  {editingLoanId === loan.memberId ? (
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                    />
                  ) : (
                    loan.year
                  )}
                </td>
                <td>
                  {editingLoanId === loan.memberId ? (
                    <input
                      type="number"
                      step="0.01"
                      name="monthrepay"
                      value={formData.monthrepay}
                      onChange={handleChange}
                    />
                  ) : (
                    loan.monthrepay
                  )}
                </td>
                <td>
                  {editingLoanId === loan.memberId ? (
                    <>
                      <button onClick={() => handleUpdate(loan.memberId)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(loan)}>Edit</button>
                      <button onClick={() => handleDelete(loan.memberId)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageLoans;
