import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
const navigate = useNavigate();
  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-logo">
        <h2>Chama</h2>
      </div>
      <ul className="landing-navbar-links">
        <li><a href="#streamline">Streamline</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#cta">Analytics</a></li>
        <li>
          <button onClick={() => navigate('/auth')}>Login / Register</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;