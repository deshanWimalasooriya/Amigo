/**
 * ProtectedRoute
 *
 * Wraps any route that requires the user to be logged in.
 * - While the initial session check is in flight (loading=true) shows a spinner.
 * - If no user is found after the check, redirects to /auth.
 * - If the user is logged in, renders the child route normally.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Full-screen centered spinner — prevents flash of redirect
    return (
      <div style={{
        height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid #334155',
          borderTop: '4px solid #818cf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
