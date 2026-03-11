import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './styles/AuthForm.css';

const API_BASE = 'http://localhost:5000/api/auth';

const AuthForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError('');
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // ── LOGIN ──────────────────────────────────────────────────────────────
        const { data } = await axios.post(
          `${API_BASE}/login`,
          { email: formData.email, password: formData.password },
          { withCredentials: true } // send/receive httpOnly JWT cookie
        );
        login(data); // store user in AuthContext + localStorage
        navigate('/dashboard');

      } else {
        // ── REGISTER ───────────────────────────────────────────────────────────
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setLoading(false);
          return;
        }
        const { data } = await axios.post(
          `${API_BASE}/register`,
          { fullName: formData.fullName, email: formData.email, password: formData.password },
          { withCredentials: true }
        );
        login(data); // auto-login after register
        navigate('/dashboard');
      }
    } catch (err) {
      // Show the error message returned from the backend
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {/* Error Banner */}
      {error && (
        <div className="auth-error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="auth-form-container">

        {/* 1. Full Name (Register only) */}
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

        {/* 2. Email */}
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

        {/* 3. Password */}
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

        {/* 4. Confirm Password (Register only) */}
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

        {/* Forgot Password (Login only) */}
        {isLogin && (
          <div className="forgot-pass">
            <a href="#">Forgot Password?</a>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-submit-gradient" disabled={loading}>
          {loading
            ? (isLogin ? 'Signing In...' : 'Creating Account...')
            : (<>{isLogin ? 'Sign In' : 'Sign Up'} <FaArrowRight style={{ marginLeft: '8px' }} /></>)
          }
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
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
