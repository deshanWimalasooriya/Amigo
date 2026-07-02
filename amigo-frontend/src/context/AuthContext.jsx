/**
 * AuthContext — global authentication state
 *
<<<<<<< HEAD
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
=======
 * FIX: Removed navigate() calls from checkSession entirely.
 * Having navigate() inside AuthContext caused a race condition:
 * when /api/auth/me resolved (even slightly after mount), it would
 * call navigate('/auth') which overwrote any in-progress navigation
 * (e.g. navigate('/user-profile')), landing the user on /auth or
 * bouncing through to WelcomePage via the * catch-all.
 *
 * All redirect responsibility now belongs to ProtectedRoute, which
 * already handles the !user case correctly.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API       = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CACHE_KEY = 'amigo_user';
>>>>>>> ravindu/master

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const navigate = useNavigate();

=======
  // Warm-start from localStorage so ProtectedRoute never flashes a redirect
>>>>>>> ravindu/master
  const cached = (() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); }
    catch { return null; }
  })();

  const [user,    setUser]    = useState(cached);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
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
=======
  // On mount: silently verify the session cookie with the server.
  // We do NOT call navigate() here under any circumstances — ProtectedRoute
  // is the single source of truth for redirect-on-unauthenticated.
>>>>>>> ravindu/master
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
<<<<<<< HEAD
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
=======
        } else {
          // Token expired / invalid — clear state & cache.
          // ProtectedRoute will redirect to /auth automatically.
          setUser(null);
          localStorage.removeItem(CACHE_KEY);
        }
      } catch {
        // Network error — keep cached user so the app still works offline.
        // Do NOT clear the user or redirect on a network failure.
>>>>>>> ravindu/master
      } finally {
        setLoading(false);
      }
    };
    checkSession();
<<<<<<< HEAD
  // eslint-disable-next-line react-hooks/exhaustive-deps
=======
>>>>>>> ravindu/master
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
<<<<<<< HEAD
    // Register immediately on login
    registerSocket(userData.id);
  }, [registerSocket]);
=======
  }, []);
>>>>>>> ravindu/master

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

<<<<<<< HEAD
=======
  // logout: clear state then let the caller navigate (e.g. Header calls navigate('/auth'))
>>>>>>> ravindu/master
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
<<<<<<< HEAD
    } catch { /* ignore */ }
    notifSocket?.disconnect();
    notifSocket = null;
    setUser(null);
    localStorage.removeItem(CACHE_KEY);
    navigate('/auth', { replace: true });
  }, [navigate]);
=======
    } catch { /* ignore network errors on logout */ }
    setUser(null);
    localStorage.removeItem(CACHE_KEY);
  }, []);
>>>>>>> ravindu/master

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
