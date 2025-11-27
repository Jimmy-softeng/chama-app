import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manageusers.css";
import { FaTrash, FaUserShield } from "react-icons/fa";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const token = localStorage.getItem("token");

  // Fetch users (uses /users endpoint on backend)
  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    setInfo("");
    try {
      if (!token) throw new Error("No auth token found. Please login as admin.");

      const res = await axios.get("http://127.0.0.1:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: filter !== "all" ? { role: filter } : {},
      });

      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setErr(error.response?.data?.msg || error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [filter]);

  // Assign role using PUT /users/<id>/role
  const assignRole = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to set role="${role}" for this user?`)) return;
    setErr(""); setInfo("");
    try {
      await axios.put(
        `http://127.0.0.1:5000/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfo(`User role updated to "${role}"`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
      setErr(error.response?.data?.msg || error.message || "Failed to update role");
    }
  };

  // Delete user using DELETE /users/<id>/delete
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setErr(""); setInfo("");
    try {
      await axios.delete(`http://127.0.0.1:5000/users/${userId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfo("User deleted");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setErr(error.response?.data?.msg || error.message || "Failed to delete user");
    }
  };

  return (
    <div className="manage-users" style={{ padding: 16 }}>
      <h2>Manage Users</h2>

      {err && <p className="error-text" style={{ color: "crimson" }}>{err}</p>}
      {info && <p className="info-text" style={{ color: "green" }}>{info}</p>}

      {/* Filter dropdown */}
      <div className="filter" style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Filter by role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={fetchUsers} style={{ marginLeft: 12 }}>Refresh</button>
      </div>

      {/* Loading */}
      {loading ? (
        <p>Loading users…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Firstname</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Lastname</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Email</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Role</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Verified</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => {
                const roleLower = (u.role || "").toString().toLowerCase();
                return (
                  <tr key={u.memberId}>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>{u.firstname}</td>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>{u.lastname}</td>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>{u.email}</td>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>{u.role}</td>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>
                      {String(u.email_verified)}
                    </td>
                    <td style={{ border: "1px solid #eee", padding: 8 }}>
                      {roleLower === "member" ? (
                        <button
                          className="btn promote"
                          onClick={() => assignRole(u.memberId, "admin")}
                          style={{ marginRight: 8 }}
                        >
                          <FaUserShield /> Promote
                        </button>
                      ) : (
                        <button
                          className="btn demote"
                          onClick={() => assignRole(u.memberId, "member")}
                          style={{ marginRight: 8 }}
                        >
                          Demote
                        </button>
                      )}

                      <button
                        className="btn delete"
                        onClick={() => deleteUser(u.memberId)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: 12 }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageUsers;
