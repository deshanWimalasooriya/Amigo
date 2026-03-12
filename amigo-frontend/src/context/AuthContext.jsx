/**
 * AuthContext — global authentication state
 *
 * Provides:
 *   user        — the logged-in user object (or null)
 *   loading     — true while the initial /api/auth/me check is in flight
 *   login(data) — stores user after a successful login/register API call
 *   logout()    — calls /api/auth/logout, clears user state, redirects to /auth
 *   updateUser  — merges updated profile fields into state after a PUT /api/auth/profile
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until /me resolves

  // -------------------------------------------------------------------------
  // On app mount: try to rehydrate the session from the httpOnly JWT cookie.
  // If the cookie is valid the backend returns the user object.
  // If not (expired / not logged in) we get a 401 and stay on the public pages.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // send the cookie
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Called by AuthForm after a successful login or register response
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Merges partial updates into the user object (after PUT /api/auth/profile)
  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  // Clears the httpOnly cookie via the backend, resets state, sends to /auth
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore network errors on logout */ }
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook — use this in every component that needs auth state
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
