import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../styles/manageShares.css";

const API_BASE = "http://127.0.0.1:5000";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ManageShares = () => {
  const [shares, setShares] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    memberId: "",
    shares: "",
    dividends: "",
    penalties: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch shares
  const fetchShares = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/shares`, {
        headers: getAuthHeader()
      });
      setShares(res.data.shares || []);
    } catch (err) {
      console.error("Failed to fetch shares:", err);
      setShares([]);
    }
  }, []);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users?role=member`, {
        headers: getAuthHeader()
      });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchShares()]);
      setLoading(false);
    };
    load();
  }, [fetchMembers, fetchShares]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () =>
    setForm({ memberId: "", shares: "", dividends: "", penalties: "" });

  const handleSave = async () => {
    setError("");
    if (!form.memberId) {
      setError("Please select a member.");
      return;
    }

    const payload = {
      memberId: Number(form.memberId),
      shares: form.shares === "" ? 0 : Number(form.shares),
      dividends: form.dividends === "" ? 0 : Number(form.dividends),
      penalties: form.penalties === "" ? 0 : Number(form.penalties)
    };

    const existing = shares.find(
      (s) => Number(s.memberId) === Number(form.memberId)
    );
    setSaving(true);

    try {
      if (existing) {
        const res = await axios.put(
          `${API_BASE}/admin/shares/${payload.memberId}`,
          payload,
          { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
        );
        setShares((prev) =>
          prev.map((s) =>
            Number(s.memberId) === payload.memberId ? res.data.shares : s
          )
        );
      } else {
        const res = await axios.post(
          `${API_BASE}/admin/shares`,
          payload,
          { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
        );
        setShares((prev) => [...prev, res.data.shares]);
      }
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.response?.data?.msg || "Failed to save shares");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Delete this shares record?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/shares/${memberId}`, {
        headers: getAuthHeader()
      });
      setShares((prev) =>
        prev.filter((s) => Number(s.memberId) !== Number(memberId))
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.msg || "Failed to delete record");
    }
  };

  return (
    <div className="manage-shares">
      <h2>Manage Shares</h2>

      <div className="create-section">
        <h3>Create / Update Shares</h3>

        <div className="form-row">
          <label>
            Member
            <select name="memberId" value={form.memberId} onChange={handleChange}>
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.fullName} (ID: {m.memberId})
                </option>
              ))}
            </select>
          </label>

          <label>
            Shares
            <input
              name="shares"
              type="number"
              min="0"
              value={form.shares}
              onChange={handleChange}
            />
          </label>

          <label>
            Dividends
            <input
              name="dividends"
              type="number"
              min="0"
              value={form.dividends}
              onChange={handleChange}
            />
          </label>

          <label>
            Penalties
            <input
              name="penalties"
              type="number"
              min="0"
              value={form.penalties}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="form-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={resetForm} disabled={saving}>
            Reset
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>

      <hr />

      <h3>Existing Share Records</h3>

      {loading ? (
        <p>Loading...</p>
      ) : shares.length === 0 ? (
        <p>No share records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Shares</th>
              <th>Dividends</th>
              <th>Penalties</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((s) => (
              <tr key={s.memberId}>
                <td>{s.memberId}</td>
                <td>{s.shares}</td>
                <td>{s.dividends}</td>
                <td>{s.penalties}</td>
                <td>
                  <button
                    onClick={() =>
                      setForm({
                        memberId: s.memberId,
                        shares: s.shares ?? "",
                        dividends: s.dividends ?? "",
                        penalties: s.penalties ?? ""
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.memberId)}
                    className="delete-btn"
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

export default ManageShares;
