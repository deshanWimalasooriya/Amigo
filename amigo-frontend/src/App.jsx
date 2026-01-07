import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Importing Pages
import Dashboard from './pages/Dashboard.jsx';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage'; // Import the new page
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-main">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;