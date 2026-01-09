import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Remove useNavigate here, because AuthContext handles navigation (or we can keep it for safety)
// But strictly following our previous Context code, the Context does the navigation.
// However, sticking to your request to NOT damage code, I will use the logic cleanly.
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // 2. Import the Hook
import './styles/AuthForm.css';

const AuthForm = () => {
  // const navigate = useNavigate(); // Context handles navigation now
  const { login, register } = useAuth(); // 3. Get functions from Context
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(''); // 4. State for error messages
  const [loading, setLoading] = useState(false); // 5. State for loading button

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
    setError(''); // Clear error when user types
  };

  // Toggle Mode
  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    // Reset data to avoid confusion on switch
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // --- LOGIN LOGIC ---
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || "Login failed. Check credentials.");
      }
    } else {
      // --- REGISTER LOGIC ---
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        setLoading(false);
        return;
      }
      
      const result = await register(formData.fullName, formData.email, formData.password);
      if (!result.success) {
        setError(result.error || "Registration failed. Try again.");
      }
    }
    
    setLoading(false);
    // Note: Navigation to /dashboard happens inside AuthContext on success
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

      {/* NEW: Error Message Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-banner"
          style={{ 
            background: 'rgba(239, 68, 68, 0.2)', 
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaExclamationCircle /> {error}
        </motion.div>
      )}

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

        {/* 2. Email (Always Visible) */}
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
        <button type="submit" className="btn-submit-gradient" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')} 
          {!loading && <FaArrowRight style={{ marginLeft: '8px' }}/>}
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