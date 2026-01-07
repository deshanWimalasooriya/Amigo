import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaHistory, FaVideo, FaCopy, FaTrash, FaClock, FaEllipsisV } from 'react-icons/fa';
import './styles/MyMeetings.css';

const MyMeetings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  // --- Mock Data ---
  const meetings = [
    {
      id: 1,
      topic: "Amigo Project Sync",
      date: "Today",
      time: "10:00 AM - 11:00 AM",
      meetingId: "844-992-101",
      status: "upcoming",
      host: "You"
    },
    {
      id: 2,
      topic: "Client Discovery Call",
      date: "Tomorrow",
      time: "2:00 PM - 2:45 PM",
      meetingId: "332-102-449",
      status: "upcoming",
      host: "You"
    },
    {
      id: 3,
      topic: "Q4 Marketing Review",
      date: "Jan 12, 2026",
      time: "09:30 AM - 10:30 AM",
      meetingId: "112-559-882",
      status: "past",
      host: "You"
    }
  ];

  // Filter based on active tab
  const filteredMeetings = meetings.filter(m => m.status === activeTab);

  const handleStart = (id) => {
    console.log("Starting meeting:", id);
    navigate('/room');
  };

  const copyInvite = (id) => {
    navigator.clipboard.writeText(`Join my Amigo meeting: https://amigo.com/join/${id}`);
    alert("Invitation copied to clipboard!");
  };

  return (
    <div className="meetings-wrapper">
      <Header />

      <div className="meetings-container">
        
        {/* Page Title & Tabs */}
        <div className="meetings-header">
          <div className="header-text">
            <h2>My Meetings</h2>
            <p>View and manage your scheduled sessions.</p>
          </div>
          
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <FaCalendarCheck /> Upcoming
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              <FaHistory /> Past
            </button>
          </div>
        </div>

        {/* Meetings List Grid */}
        <div className="meetings-grid">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                
                <div className="card-top">
                  <div className="meeting-date-badge">
                    <span className="badge-label">{meeting.date}</span>
                  </div>
                  <button className="btn-options"><FaEllipsisV /></button>
                </div>

                <div className="card-body">
                  <h3>{meeting.topic}</h3>
                  <div className="meta-info">
                    <div className="meta-row">
                      <FaClock className="meta-icon" /> 
                      <span>{meeting.time}</span>
                    </div>
                    <div className="meta-row">
                      <span className="id-label">ID:</span> 
                      <span className="id-value">{meeting.meetingId}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  {activeTab === 'upcoming' ? (
                    <>
                      <button className="btn-action start" onClick={() => handleStart(meeting.id)}>
                        Start
                      </button>
                      <button className="btn-action copy" onClick={() => copyInvite(meeting.meetingId)} title="Copy Invitation">
                        <FaCopy />
                      </button>
                      <button className="btn-action delete" title="Delete">
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-action secondary">View Details</button>
                      <span className="past-label">Finished</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="empty-state">
              <div className="empty-icon"><FaVideo /></div>
              <h3>No {activeTab} meetings found</h3>
              <p>Schedule a new meeting to get started.</p>
              <button className="btn-schedule-now" onClick={() => navigate('/schedule')}>
                Schedule Meeting
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyMeetings;