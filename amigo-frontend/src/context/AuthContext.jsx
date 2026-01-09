import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (id, name, pmi)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Check if user is logged in (Hydration)
  // We can add a specialized endpoint '/api/auth/me' later to verify cookie on reload.
  // For now, we will rely on local state or persisting it manually if needed.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      // Save basic info to localStorage so we don't lose it on refresh
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error("Login Failed:", error.response?.data?.message);
      return { success: false, error: error.response?.data?.message || "Login failed" };
    }
  };

  // 3. Register Function
  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error("Registration Failed:", error.response?.data?.message);
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    }
  };

  // 4. Logout Function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Auth easily
export const useAuth = () => useContext(AuthContext);