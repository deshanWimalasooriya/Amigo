import React, { useState } from 'react';
import Header from '../components/Header'; // Reusing your fixed header
import { FaPlay, FaDownload, FaShareAlt, FaTrash, FaSearch, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './styles/Recordings.css';

const Recordings = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // --- Mock Data for Recordings ---
  const recordings = [
    {
      id: 1,
      title: "Weekly Team Sync - Q1 Planning",
      date: "Oct 24, 2025",
      duration: "45:12",
      size: "128 MB",
      thumbnailColor: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" // CSS Gradient as placeholder
    },
    {
      id: 2,
      title: "Client Discovery: Aurelia Travel",
      date: "Oct 22, 2025",
      duration: "01:12:30",
      size: "450 MB",
      thumbnailColor: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
    },
    {
      id: 3,
      title: "Project Amigo Architecture Review",
      date: "Oct 15, 2025",
      duration: "32:05",
      size: "85 MB",
      thumbnailColor: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
    },
    {
      id: 4,
      title: "React Components Workshop",
      date: "Oct 10, 2025",
      duration: "15:42",
      size: "42 MB",
      thumbnailColor: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)"
    }
  ];

  // Filter Logic
  const filteredRecordings = recordings.filter(rec => 
    rec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="recordings-wrapper">
      <Header />
      
      <div className="recordings-container">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="header-title">
            <h2>Meeting Recordings</h2>
            <p>Access and manage your recorded video sessions.</p>
          </div>

          {/* Search Bar */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search recordings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Video Grid */}
        <div className="video-grid">
          {filteredRecordings.length > 0 ? (
            filteredRecordings.map((rec) => (
              <div key={rec.id} className="video-card">
                
                {/* Thumbnail Area */}
                <div className="thumbnail" style={{ background: rec.thumbnailColor }}>
                  <div className="play-overlay">
                    <button className="btn-play"><FaPlay /></button>
                  </div>
                  <span className="duration-badge">{rec.duration}</span>
                </div>

                {/* Content Area */}
                <div className="card-content">
                  <div className="card-info">
                    <h3>{rec.title}</h3>
                    <div className="meta-tags">
                      <span><FaCalendarAlt /> {rec.date}</span>
                      <span><FaClock /> {rec.size}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="card-actions">
                    <button className="action-btn download" title="Download">
                      <FaDownload /> Download
                    </button>
                    <div className="right-actions">
                      <button className="icon-action" title="Share"><FaShareAlt /></button>
                      <button className="icon-action delete" title="Delete"><FaTrash /></button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No recordings found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Recordings;