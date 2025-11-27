import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/Navbar.css";

const NavbarMember = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // optional
    navigate("/auth", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return handleLogout();

    axios
      .get("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.error(err);
        handleLogout();
      });
  }, [handleLogout]);

  const getInitials = () => {
    if (!user) return "";
    return user.firstname[0].toUpperCase() + user.lastname[0].toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user ? (
          <h2>
            Welcome, <span className="highlight">{user.firstname}</span>
          </h2>
        ) : (
          <h2>Loading...</h2>
        )}
      </div>

      <div className="navbar-right">
        {user && (
          <div className="avatar" title={`${user.firstname} ${user.lastname}`}>
            {getInitials()}
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarMember;
