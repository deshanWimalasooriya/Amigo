/**
 * AuthContext — global authentication state
 *
 * FIX: User object is now persisted to localStorage as a warm-start cache.
 * On page refresh, we immediately restore from localStorage (so ProtectedRoute
 * doesn't flash-redirect to /auth) while the /api/auth/me verification runs
 * in the background. If /me returns 401, we clear the cache and redirect.
 *
 * ADDITION: After a successful session verification, we emit 'register-user'
 * on a shared Socket.IO connection so the server can push real-time
 * notifications (bell badge) to this specific user.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API        = import.meta.env.VITE_API_URL    || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER || 'http://localhost:5000';
const CACHE_KEY  = 'amigo_user';

// Module-level socket — created once, shared across the app for notifications.
// This is separate from the per-room socket created inside Room.jsx.
let notifSocket = null;

export const getNotifSocket = () => notifSocket;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const cached = (() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); }
    catch { return null; }
  })();

  const [user,    setUser]    = useState(cached);
  const [loading, setLoading] = useState(true);

  // ── Register user with socket for live notification pushes ──────────────
  const registerSocket = useCallback((userId) => {
    if (!userId) return;
    if (!notifSocket || !notifSocket.connected) {
      notifSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }
    notifSocket.emit('register-user', userId);
  }, []);

  // ── Session verification on mount ────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          // ✅ Register with socket so notifications arrive in real-time
          registerSocket(data.id);
        } else {
          setUser(null);
          localStorage.removeItem(CACHE_KEY);
          notifSocket?.disconnect();
          notifSocket = null;
          const pub = ['/', '/auth'];
          if (!pub.includes(window.location.pathname)) {
            navigate('/auth', { replace: true });
          }
        }
      } catch {
        // Network error — keep cached user, don't redirect
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
    // Register immediately on login
    registerSocket(userData.id);
  }, [registerSocket]);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore */ }
    notifSocket?.disconnect();
    notifSocket = null;
    setUser(null);
    localStorage.removeItem(CACHE_KEY);
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
