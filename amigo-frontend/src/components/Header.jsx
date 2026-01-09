import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaSearch, FaChevronDown } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/Header.css';
import amigoLogo from '../assets/Amigo.png'; 
import NotificationPanel from './NotificationPanel'; // 1. Import Panel

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Notification State ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(3); // Start with 3 for demo
  const panelRef = useRef(null); // To detect clicks outside

  // Dummy Data
  const notifications = [
    { id: 1, type: 'meeting', title: 'Daily Standup', message: 'Meeting started 5 mins ago', time: 'Now', unread: true },
    { id: 2, type: 'invite', title: 'New Team Member', message: 'Sarah joined the Design Team', time: '1 hr ago', unread: true },
    { id: 3, type: 'alert', title: 'Server Maintenance', message: 'Scheduled for tonight at 2 AM', time: '5 hrs ago', unread: true },
  ];

  // --- Click Outside Logic ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // If panel is open and we click outside:
        if (showNotifications) {
          setShowNotifications(false);
          setNotifCount(0); // Reset count on close
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Toggle Handler
  const toggleNotifications = () => {
    // If opening, keep count. If closing via toggle, reset count.
    if (showNotifications) {
        setNotifCount(0);
    }
    setShowNotifications(!showNotifications);
  };

  const getNavClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="app-header">
      {/* 1. Brand Section (Left) */}
      <div className="header-left">
        <div className="brand-logo" onClick={() => navigate('/')}>
          <img 
            src={amigoLogo} 
            alt="Amigo Logo" 
            className="logo-image"
            style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
      </div>

      {/* 2. Combined Right Section */}
      <div className="header-actions-group">
        
        {/* Navigation */}
        <nav className="header-nav">
          <a className={getNavClass('/dashboard')} onClick={() => navigate('/dashboard')}>Dashboard</a>
          <a className={getNavClass('/meetings')} onClick={() => navigate('/meetings')}>My Meetings</a>
          <a className={getNavClass('/recordings')} onClick={() => navigate('/recordings')}>Recordings</a>
          <a className={getNavClass('/team')} onClick={() => navigate('/team')}>Team</a>
        </nav>

        <div className="header-divider"></div>

        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        {/* --- Notification Bell Wrapper (Position Relative needed for Popup) --- */}
        <div className="notification-wrapper" ref={panelRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={toggleNotifications}>
            <FaBell />
            {/* Show dot only if count > 0 */}
            {notifCount > 0 && <span className="notification-dot">{notifCount}</span>}
            </button>

            {/* The Popup Panel */}
            <NotificationPanel 
                notifications={notifications} 
                isOpen={showNotifications} 
            />
        </div>

        {/* User Profile */}
        <div className="user-profile-pill" onClick={() => navigate('/user-profile')}>
          <div className="avatar-small">A</div>
          <span className="username">Alex Sterling</span>
          <FaChevronDown className="chevron-icon" />
        </div>

      </div>
    </header>
  );
};

export default Header;