import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './styles/AuthForm.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setError(''); // clear error on any keystroke
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side validation ──
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        setError('Full name is required.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    // ── Call the real backend API ──
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // receive the httpOnly JWT cookie
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the exact error message from the backend
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // ── Success: store user in global context, redirect ──
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card-glass">
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
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          color: '#fca5a5',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-container">

        {/* Full Name — Register only */}
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

        {/* Email */}
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </div>

        {/* Confirm Password — Register only */}
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
                  autoComplete="new-password"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLogin && (
          <div className="forgot-pass">
            <a href="#">Forgot Password?</a>
          </div>
        )}

        <button type="submit" className="btn-submit-gradient" disabled={loading}>
          {loading
            ? (isLogin ? 'Signing in...' : 'Creating account...')
            : (<>{isLogin ? 'Sign In' : 'Sign Up'} <FaArrowRight style={{ marginLeft: 8 }} /></>)
          }
        </button>

        <div className="divider"><span>OR</span></div>

        <div className="social-login">
          <button type="button" className="social-btn"><FaGoogle /> Google</button>
          <button type="button" className="social-btn"><FaGithub /> GitHub</button>
        </div>
      </form>

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
