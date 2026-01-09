import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage />} /> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path="/new-meeting" element={<NewMeeting />} />
            
            {/* ⬇️ FIXED LINE: Added /:meetingId ⬇️ */}
            <Route path="/room/:meetingId" element={<Room />} />
            {/* ⬆️ Now it catches /room/123456 correctly ⬆️ */}

            <Route path="/meetings" element={<MyMeetings />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/history" element={<History />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;