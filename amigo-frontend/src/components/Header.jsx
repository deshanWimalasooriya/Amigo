import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaSearch, FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth
import './styles/Header.css';
import amigoLogo from '../assets/Amigo.png'; 
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // 2. Get User & Logout function

  // --- Notification State ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const notifRef = useRef(null); // Ref for notification panel

  // --- Profile Menu State ---
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null); // Ref for profile dropdown

  // Dummy Data
  const notifications = [
    { id: 1, type: 'meeting', title: 'Daily Standup', message: 'Meeting started 5 mins ago', time: 'Now', unread: true },
    { id: 2, type: 'invite', title: 'New Team Member', message: 'Sarah joined the Design Team', time: '1 hr ago', unread: true },
    { id: 3, type: 'alert', title: 'Server Maintenance', message: 'Scheduled for tonight at 2 AM', time: '5 hrs ago', unread: true },
  ];

  // --- Click Outside Logic (Combined) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Notification Panel if clicked outside
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (showNotifications) {
          setShowNotifications(false);
          setNotifCount(0);
        }
      }
      // Close Profile Menu if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  // Toggle Handler
  const toggleNotifications = () => {
    if (showNotifications) setNotifCount(0);
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false); // Close profile if opening notifs
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  // Safety: If user is not loaded yet, show placeholder or null
  if (!user) return null; 

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

        {/* --- Notification Bell --- */}
        <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={toggleNotifications}>
            <FaBell />
            {notifCount > 0 && <span className="notification-dot">{notifCount}</span>}
            </button>

            <NotificationPanel 
                notifications={notifications} 
                isOpen={showNotifications} 
            />
        </div>

        {/* --- User Profile Dropdown --- */}
        <div 
          className="user-profile-wrapper" 
          ref={profileRef}
          style={{ position: 'relative' }} // Anchor for dropdown
        >
          <div 
            className="user-profile-pill" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="avatar-small">
               {user.fullName.charAt(0).toUpperCase()}
            </div>
            {/* Dynamic Name */}
            <span className="username">{user.fullName}</span> 
            <FaChevronDown className={`chevron-icon ${showProfileMenu ? 'rotate' : ''}`} />
          </div>

          {/* The Dropdown Menu */}
          {showProfileMenu && (
            <div className="header-dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate('/user-profile')}>
                <FaUserCircle /> Profile
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt /> Log Out
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;