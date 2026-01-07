import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaArrowRight } from 'react-icons/fa';
import './styles/AuthForm.css'; // Make sure this path matches where you saved the CSS

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Toggle between Login and Register
  const toggleMode = () => setIsLogin(!isLogin);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login success
    console.log(isLogin ? "Logged In" : "Registered");
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
        
        {/* FIX: Animation ONLY wraps the conditional Name field */}
        <AnimatePresence mode='wait'>
          {!isLogin && (
            <motion.div 
              key="name-field"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="input-group"
            >
              <FaUser className="input-icon" />
              <input type="text" placeholder="Full Name" required />
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMMON: Email Input (Outside animation wrapper) */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input type="email" placeholder="Email Address" required />
        </div>

        {/* COMMON: Password Input (Outside animation wrapper) */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input type="password" placeholder="Password" required />
        </div>
          
        {/* Forgot Password Link (Login Only) */}
        {isLogin && (
          <div className="forgot-pass">
            <a href="#">Forgot Password?</a>
          </div>
        )}

        {/* Submit Button */}
        <motion.button 
          className="btn-submit-gradient"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLogin ? 'Sign In' : 'Sign Up'} <FaArrowRight />
        </motion.button>

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