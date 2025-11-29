// client/src/pages/Member/Loans.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/loans.css";
import { API_BASE } from "../../config";


function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Loans() {
  const [form, setForm] = useState({
    amount: "",
    interest: 0.08,
    year: "",
    monthrepay: ""
  });
  const [loans, setLoans] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Use this if backend path is /loans/me (as in your app.py)
  const MY_LOANS_PATH = `${API_BASE}/loans/me`;
  const APPLY_LOAN_PATH = `${API_BASE}/loans/apply`;

  function handleAuthError() {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  // fetch loans
  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await fetch(MY_LOANS_PATH, {
          headers: getAuthHeader()
        });
        if (res.status === 401) {
          handleAuthError();
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setMsg(data.msg || "Error fetching loans");
          setLoans([]);
        } else {
          setLoans(data.loans || []);
        }
      } catch (err) {
        setMsg("Server error while fetching loans");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally no token dependency so re-render doesn't re-trigger unnecessarily

  // handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // submit loan application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // client-side validation
    const amountNum = parseFloat(form.amount);
    const interestNum = parseFloat(form.interest);
    const yearNum = parseInt(form.year, 10);
    const monthrepayNum = parseFloat(form.monthrepay);

    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setMsg("Amount must be a positive number");
      return;
    }
    if (Number.isNaN(yearNum) || yearNum <= 0) {
      setMsg("Year must be a positive integer");
      return;
    }
    if (Number.isNaN(monthrepayNum) || monthrepayNum <= 0) {
      setMsg("Monthly repayment must be a positive number");
      return;
    }
    // optional interest bounds
    if (Number.isNaN(interestNum) || interestNum < 0 || interestNum > 5) {
      setMsg("Interest value out of range");
      return;
    }

    const payload = {
      amount: amountNum,
      interest: interestNum,
      year: yearNum,
      monthrepay: monthrepayNum
    };

    try {
      const res = await fetch(APPLY_LOAN_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        setMsg(data.msg || "Loan application failed");
        return;
      }

      setMsg("Loan application submitted ✅");

      // refresh loans list
      setLoading(true);
      const refresh = await fetch(MY_LOANS_PATH, {
        headers: getAuthHeader()
      });
      if (refresh.status === 401) {
        handleAuthError();
        return;
      }
      const updated = await refresh.json();
      if (refresh.ok) setLoans(updated.loans || []);
      else setLoans([]);

      // reset form
      setForm({ amount: "", interest: 0.08, year: "", monthrepay: "" });
    } catch (err) {
      setMsg("Server error while applying for loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loans-container">
      <h2>Loan Applications</h2>
      {msg && <p className="msg">{msg}</p>}

      {/* Loan Form */}
      <form onSubmit={handleSubmit} className="loan-form">
        <input
          type="number"
          name="amount"
          placeholder="Loan Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.01"
          name="interest"
          placeholder="Interest (default 0.08)"
          value={form.interest}
          onChange={handleChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="monthrepay"
          placeholder="Monthly Repayment"
          value={form.monthrepay}
          onChange={handleChange}
          required
        />
        <button type="submit">Apply Loan</button>
      </form>

      {/* Loan List */}
      <h3>My Loans</h3>

      {loading ? (
        <p>Loading...</p>
      ) : loans.length > 0 ? (
        <table className="loans-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Interest</th>
              <th>Year</th>
              <th>Monthly Repayment</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const key = loan.loanId ?? loan.id ?? loan.memberId ?? Math.random();
              return (
                <tr key={key}>
                  <td>{loan.amount}</td>
                  <td>{loan.interest}</td>
                  <td>{loan.year}</td>
                  <td>{loan.monthrepay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No loans found</p>
      )}
    </div>
  );
}
