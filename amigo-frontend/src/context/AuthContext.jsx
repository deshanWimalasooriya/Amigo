import React, { createContext, useContext, useState } from 'react';

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Stores the logged-in user globally across the app.
// User data is persisted in localStorage so it survives page refreshes.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Rehydrate from localStorage on first load
    try {
      const stored = localStorage.getItem('amigoUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Call this after a successful login or register API response
  const login = (userData) => {
    localStorage.setItem('amigoUser', JSON.stringify(userData));
    setUser(userData);
  };

  // Call this on logout
  const logout = () => {
    localStorage.removeItem('amigoUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
