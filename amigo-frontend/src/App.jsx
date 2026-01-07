import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Importing Pages
import Dashboard from './pages/Dashboard.jsx';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile.jsx';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-main">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/user-profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;