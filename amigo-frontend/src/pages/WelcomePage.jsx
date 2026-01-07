import React from 'react';
import { Link } from 'react-router-dom'; // <-- This fixes your error
import './styles/WelcomePage.css';
import { FaVideo, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const WelcomePage = () => {
  return (
    <div className="page-container">
      {/* 1. Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-emoji">🤝</span> Amigo
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          
          {/* Linked to your new Auth Page */}
          <Link to="/auth" className="btn-login">Log In</Link>
        </div>
      </nav>

      {/* 2. Main Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">New v2.0 is live</div>
          <h1 className="hero-title">
            Premium Video Meetings <br />
            <span className="highlight-text">Built for Business.</span>
          </h1>
          <p className="hero-subtitle">
            Amigo provides crystal-clear video conferencing with zero lag. 
            Secure, reliable, and designed for teams that need to get work done.
          </p>
          
          <div className="cta-group">
            {/* Main Call to Action also links to Auth */}
            <Link to="/auth">
              <button className="btn-primary">Get Started Free</button>
            </Link>
            
            <button className="btn-outline">View Demo</button>
          </div>

          <div className="trust-badges">
            <div className="trust-item"><FaVideo /> HD Quality</div>
            <div className="trust-item"><FaShieldAlt /> End-to-End Encrypted</div>
            <div className="trust-item"><FaGlobe /> Low Latency</div>
          </div>
        </div>

        {/* 3. Visual Side (Right) */}
        <div className="hero-visual">
          <div className="visual-card">
            {/* Abstract UI representation of a meeting */}
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="card-body">
              <div className="avatar-grid">
                <div className="avatar a1"></div>
                <div className="avatar a2"></div>
                <div className="avatar a3"></div>
                <div className="avatar a4"></div>
              </div>
              <div className="control-bar"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;