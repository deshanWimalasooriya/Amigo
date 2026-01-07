import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Importing Pages
import Dashboard from './pages/Dashboard.jsx';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile.jsx';
import ScheduleMeeting from './pages/ScheduleMeeting.jsx';
import JoinMeeting from './pages/JoinMeeting.jsx';
import NewMeeting from './pages/NewMeeting.jsx';
import Room from './pages/Room.jsx';
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
          <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
          <Route path="/join" element={<JoinMeeting />} />
          <Route path="/new-meeting" element={<NewMeeting />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;