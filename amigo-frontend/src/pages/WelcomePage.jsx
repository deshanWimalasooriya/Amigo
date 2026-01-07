import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/WelcomePage.css';
import Footer from '../components/Footer.jsx';
import { FaVideo, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const WelcomePage = () => {
  const [displayedText, setDisplayedText] = useState({ line1: '', line2: '' });
  
  const text1 = "Premium Video Meetings";
  const text2 = "Built for Business.";

  useEffect(() => {
    let animationInterval;
    let resetTimeout;
    let phase = 'typing1'; // phases: typing1 -> typing2 -> waiting -> reset
    let index = 0;

    const tick = () => {
      if (phase === 'typing1') {
        // Type Line 1
        if (index <= text1.length) {
          setDisplayedText(prev => ({ ...prev, line1: text1.substring(0, index) }));
          index++;
        } else {
          // Switch to Line 2
          phase = 'typing2';
          index = 0; 
        }
      } else if (phase === 'typing2') {
        // Type Line 2
        if (index <= text2.length) {
          setDisplayedText(prev => ({ ...prev, line2: text2.substring(0, index) }));
          index++;
        } else {
          // Done typing, start wait timer
          phase = 'waiting';
          clearInterval(animationInterval);
          resetTimeout = setTimeout(() => {
            // Reset and restart
            setDisplayedText({ line1: '', line2: '' });
            phase = 'typing1';
            index = 0;
            animationInterval = setInterval(tick, 50);
          }, 4000); // Wait 4 seconds
        }
      }
    };

    // Start the loop
    animationInterval = setInterval(tick, 50);

    // Cleanup
    return () => {
      clearInterval(animationInterval);
      clearTimeout(resetTimeout);
    };
  }, []);

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-emoji">🤝</span> Amigo
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/auth" className="btn-login">Log In</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          {/* <div className="badge">New v2.0 is live</div> */}
          
          {/* Fixed height container to prevent jumping */}
          <div className="title-container">
            <h1 className="hero-title">
              {displayedText.line1}<br />
              <span className="highlight-text">
                {displayedText.line2}
              </span>
              <span className="cursor">|</span>
            </h1>
          </div>

          <p className="hero-subtitle">
            Amigo provides crystal-clear video conferencing with zero lag. 
            Secure, reliable, and designed for teams that need to get work done.
          </p>
          
          <div className="cta-group">
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

        <div className="hero-visual">
          <div className="visual-card">
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

      {/* Add Footer Here at the bottom */}
      <Footer />
    </div>
  );
};

export default WelcomePage;