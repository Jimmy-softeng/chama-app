import React from "react";
import { Link } from "react-router-dom";
import "../../styles/sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Admin Dashboard</h2>
      <ul>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/payments">Manage Payments</Link></li>
        <li><Link to="/admin/loans">Manage Loans</Link></li> {/* 👈 NEW */}
        <li><Link to="/admin/shares">Manage Shares</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
