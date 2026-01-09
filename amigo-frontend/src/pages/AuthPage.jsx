import React from 'react';
import AuthForm from '../components/AuthForm';
import Footer from '../components/Footer';
import './styles/AuthPage.css'; 

const AuthPage = () => {
  return (
    <div className="auth-page-container">
      {/* Background decoration */}
      <div className="auth-blob"></div>
      
      {/* Wrapper to center the form */}
      <div className="auth-content-wrapper">
        <AuthForm />
      </div>

      {/* Footer stays at the bottom */}
      <Footer />
    </div>
  );
};

export default AuthPage;