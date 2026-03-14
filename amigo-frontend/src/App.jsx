import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importing Pages
import Dashboard from './pages/Dashboard.jsx';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile.jsx';
import ScheduleMeeting from './pages/ScheduleMeeting.jsx';
import JoinMeeting from './pages/JoinMeeting.jsx';
import NewMeeting from './pages/NewMeeting.jsx';
import Room from './pages/Room.jsx';
import MyMeetings from './pages/MyMeetings.jsx';
import Recordings from './pages/Recordings.jsx';
import History from './pages/History.jsx';
import Team from './pages/Team.jsx';
import './index.css';

// If user is not logged in, redirect to /auth.
// Otherwise render the requested page as normal.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/schedule-meeting" element={<ProtectedRoute><ScheduleMeeting /></ProtectedRoute>} />
            <Route path="/join" element={<ProtectedRoute><JoinMeeting /></ProtectedRoute>} />
            <Route path="/new-meeting" element={<ProtectedRoute><NewMeeting /></ProtectedRoute>} />
            <Route path="/room/:meetingId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><MyMeetings /></ProtectedRoute>} />
            <Route path="/recordings" element={<ProtectedRoute><Recordings /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
