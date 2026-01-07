import React, { useState } from 'react';
import Header from '../components/Header';
import { FaCalendarAlt, FaClock, FaUserFriends, FaPhoneSlash, FaCheckCircle, FaBan, FaTrashAlt } from 'react-icons/fa';
import './styles/History.css';

const History = () => {
  // --- Mock Data ---
  const historyData = [
    {
      id: 1,
      topic: "Amigo Project Sync",
      date: "Today, 10:00 AM",
      duration: "55 mins",
      participants: 4,
      status: "completed", // completed, missed, cancelled
      host: "You"
    },
    {
      id: 2,
      topic: "Client Intro: Aurelia Travel",
      date: "Yesterday, 2:00 PM",
      duration: "0 mins",
      participants: 1,
      status: "missed",
      host: "Client"
    },
    {
      id: 3,
      topic: "Q4 Marketing Review",
      date: "Jan 05, 2026",
      duration: "1 hr 12 mins",
      participants: 8,
      status: "completed",
      host: "Sarah (CMO)"
    },
    {
      id: 4,
      topic: "Quick Catch-up",
      date: "Jan 02, 2026",
      duration: "-",
      participants: 2,
      status: "cancelled",
      host: "You"
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle className="status-icon success" />;
      case 'missed': return <FaPhoneSlash className="status-icon danger" />;
      case 'cancelled': return <FaBan className="status-icon warning" />;
      default: return <FaCheckCircle />;
    }
  };

  return (
    <div className="history-wrapper">
      <Header />

      <div className="history-container">
        {/* Page Header */}
        <div className="history-header">
          <div className="header-content">
            <h2>Meeting History</h2>
            <p>A log of all your past calls and sessions.</p>
          </div>
          <button className="btn-clear-history">
            <FaTrashAlt /> Clear All
          </button>
        </div>

        {/* History List */}
        <div className="history-list">
          {historyData.map((item) => (
            <div key={item.id} className="history-item">
              
              {/* Left: Icon & Topic */}
              <div className="history-main">
                <div className={`icon-box ${item.status}`}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="info-text">
                  <h3>{item.topic}</h3>
                  <span className="host-label">Hosted by {item.host}</span>
                </div>
              </div>

              {/* Middle: Meta Details */}
              <div className="history-meta">
                <div className="meta-group">
                  <FaCalendarAlt /> {item.date}
                </div>
                <div className="meta-group">
                  <FaClock /> {item.duration}
                </div>
                <div className="meta-group">
                  <FaUserFriends /> {item.participants} People
                </div>
              </div>

              {/* Right: Status Badge */}
              <div className="history-status">
                <span className={`status-badge ${item.status}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;