import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaArrowRight } from 'react-icons/fa';
import './styles/AuthForm.css';

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // State to capture input values
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle Mode
  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    // Reset passwords to avoid confusion on switch
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Logging in:", formData.email);
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      console.log("Registering:", formData.fullName);
    }
    navigate('/dashboard');
  };

  return (
    <div className="auth-card-glass">
      {/* Header Section */}
      <div className="auth-header">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p>
          {isLogin 
            ? 'Enter your details to access your meetings.' 
            : 'Join Amigo to start connecting with the world.'}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="auth-form-container">
        
        {/* 1. Full Name (Only shows in Register mode) */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div 
              key="fullname-field"
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="input-group" style={{ marginBottom: 0 }}>
                <FaUser className="input-icon" />
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required={!isLogin} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Email (Always Visible - Static to prevent duplication bugs) */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>

        {/* 3. Password (Always Visible) */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>

        {/* 4. Confirm Password (Only shows in Register mode) */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div 
              key="confirm-field"
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="input-group" style={{ marginBottom: 0 }}>
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot Password Link (Login Only) */}
        {isLogin && (
          <div className="forgot-pass">
            <a href="#">Forgot Password?</a>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-submit-gradient">
          {isLogin ? 'Sign In' : 'Sign Up'} <FaArrowRight style={{ marginLeft: '8px' }}/>
        </button>

        {/* Divider */}
        <div className="divider"><span>OR</span></div>

        {/* Social Buttons */}
        <div className="social-login">
          <button type="button" className="social-btn"><FaGoogle /> Google</button>
          <button type="button" className="social-btn"><FaGithub /> GitHub</button>
        </div>
      </form>

      {/* Toggle Footer */}
      <div className="auth-footer">
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;