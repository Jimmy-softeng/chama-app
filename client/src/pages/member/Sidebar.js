import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Member Dashboard</h2>
      <ul>
        <li>
          <NavLink 
            to="/member/shares" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            Shares
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/member/payments" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            Payments
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/member/loans" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            Loans
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
