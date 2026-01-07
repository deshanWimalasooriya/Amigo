import React from 'react';
import AuthForm from '../components/AuthForm';

const AuthPage = () => {
  return (
    <div style={pageStyle}>
      {/* Background decoration */}
      <div style={blobStyle}></div>
      
      {/* The Component */}
      <AuthForm />
    </div>
  );
};

// Inline styles for the page layout
const pageStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0f172a',
  position: 'relative',
  overflow: 'hidden'
};

const blobStyle = {
  position: 'absolute',
  width: '600px',
  height: '600px',
  background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(15,23,42,0) 70%)',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 0,
};

export default AuthPage;