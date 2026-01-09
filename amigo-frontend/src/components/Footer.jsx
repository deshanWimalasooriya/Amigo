import React from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaArrowRight } from 'react-icons/fa';
import './styles/Footer.css';
import amigoLogo from '../assets/Amigo.png'; // 1. Import the logo

const Footer = () => {
  return (
    <footer className="footer-container">
      
      {/* Top Section: Grid Layout */}
      <div className="footer-content">
        
        {/* Col 1: Brand & Social */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            {/* 2. Replaced Emoji/Text with Image */}
            <img 
              src={amigoLogo} 
              alt="Amigo Logo" 
              style={{ height: '50px', width: 'auto', marginBottom: '10px' }} 
            />
          </div>
          <p className="footer-desc">
            The next generation of video conferencing. 
            Secure, reliable, and built for modern teams.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaLinkedin /></a>
            <a href="#" className="social-icon"><FaGithub /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
          </div>
        </div>

        {/* Col 2: Product */}
        <div className="footer-col">
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Security</a>
          <a href="#">Integrations</a>
          <a href="#">Changelog</a>
        </div>

        {/* Col 3: Company */}
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
          <a href="#">Partners</a>
        </div>

        {/* Col 4: Newsletter */}
        <div className="footer-col newsletter-col">
          <h4>Stay Updated</h4>
          <p>Join our newsletter for the latest updates and exclusive offers.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button><FaArrowRight /></button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Copyright */}
      <div className="footer-bottom">
        <p>&copy; 2026 Amigo Inc. All rights reserved.</p>
        <div className="legal-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;