import React from 'react';
import { FaBell, FaSearch, FaPlus, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './styles/Header.css'; // We will create this specific CSS

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {/* 1. Brand Section */}
      <div className="header-left">
        <div className="brand-logo" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">🤝</span>
          <span className="brand-name">Amigo</span>
        </div>
      </div>

      {/* 2. Navigation (Center) */}
      <nav className="header-nav">
        <a href="#" className="nav-link active">Dashboard</a>
        <a href="#" className="nav-link">My Meetings</a>
        <a href="#" className="nav-link">Recordings</a>
        <a href="#" className="nav-link">Team</a>
      </nav>

      {/* 3. Actions & Profile (Right) */}
      <div className="header-right">
        {/* Quick Search */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search meetings..." />
        </div>

        {/* Action Icons */}
        <button className="icon-btn">
          <FaBell />
          <span className="notification-dot"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="user-profile-pill">
          <div className="avatar-small">A</div>
          <span className="username" onClick={() => navigate('./user-profile')}>Alex Sterling</span>
          <FaChevronDown className="chevron-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;