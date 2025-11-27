import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // optional
    navigate("/auth", { replace: true }); // prevent back navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>
          Welcome, <span className="highlight">Admin</span>
        </h2>
      </div>

      <div className="navbar-right">
        <div className="avatar" title="Admin">AD</div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
