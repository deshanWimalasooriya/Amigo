import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // 1. Import your API connection
import { FaCalendarAlt, FaClock, FaHeading, FaLock, FaVideo, FaCopy } from 'react-icons/fa';
import './styles/ScheduleMeeting.css';

const ScheduleMeeting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // 2. Loading state to prevent double-clicks
  
  // State for form data
  const [formData, setFormData] = useState({
    topic: "Amigo Strategy Meeting",
    date: new Date().toISOString().split('T')[0], // Default to today
    time: "10:00",
    duration: "45",
    passcode: "123456",
    hostVideo: true,
    participantVideo: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // 3. The Real Backend Connection
  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This sends the data to your new POST /api/meetings endpoint
      const response = await api.post('/meetings', formData);
      
      console.log("Meeting Created:", response.data);
      alert("Success! Meeting has been scheduled.");
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      console.error("Schedule Error:", err);
      alert("Failed to schedule meeting. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-wrapper">
      <Header />

      <div className="schedule-container">
        
        {/* --- LEFT: The Configuration Form --- */}
        <div className="form-panel">
          <div className="panel-header">
            <div className="icon-badge"><FaCalendarAlt /></div>
            <h2>Schedule Meeting</h2>
            <p>Set up the details for your next video call.</p>
          </div>

          <form onSubmit={handleSchedule}>
            
            {/* Topic Input */}
            <div className="form-group">
              <label>Topic</label>
              <div className="input-icon-wrapper">
                <FaHeading className="field-icon" />
                <input 
                  type="text" 
                  name="topic" 
                  value={formData.topic} 
                  onChange={handleChange} 
                  placeholder="Enter meeting topic" 
                  required
                />
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <div className="input-icon-wrapper">
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Time</label>
                <div className="input-icon-wrapper">
                  <input 
                    type="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration & Passcode Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Duration (min)</label>
                <div className="input-icon-wrapper">
                  <FaClock className="field-icon" />
                  <select name="duration" value={formData.duration} onChange={handleChange}>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 Hour</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Passcode</label>
                <div className="input-icon-wrapper">
                  <FaLock className="field-icon" />
                  <input 
                    type="text" 
                    name="passcode" 
                    value={formData.passcode} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* Video Settings Toggles */}
            <div className="toggle-section">
              <div className="toggle-row">
                <div className="toggle-label">
                  <span>Host Video</span>
                  <small>Start video when meeting begins</small>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="hostVideo" 
                    checked={formData.hostVideo} 
                    onChange={handleChange} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-label">
                  <span>Participant Video</span>
                  <small>Allow participants to toggle video</small>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="participantVideo" 
                    checked={formData.participantVideo} 
                    onChange={handleChange} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule"}
              </button>
            </div>

          </form>
        </div>

        {/* --- RIGHT: The Live Preview Card --- */}
        <div className="preview-panel">
          <div className="preview-label">LIVE INVITATION PREVIEW</div>
          
          <div className="invite-card">
            <div className="invite-header">
              <div className="logo-small">🤝</div>
              <span>Amigo Invitation</span>
            </div>
            
            <div className="invite-body">
              <h3>{formData.topic || "Untitled Meeting"}</h3>
              
              <div className="invite-details">
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{formData.date}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{formData.time} ({formData.duration} min)</span>
                </div>
                <div className="detail-item">
                  <span className="label">ID:</span>
                  <span className="value">883-992-102</span>
                </div>
                <div className="detail-item">
                  <span className="label">Passcode:</span>
                  <span className="value">{formData.passcode}</span>
                </div>
              </div>

              <div className="invite-link-box">
                <p>https://amigo.com/join/883992102</p>
                <FaCopy className="copy-icon" />
              </div>

              <button className="btn-preview-join">Join Meeting</button>
            </div>

            <div className="invite-footer">
              <FaVideo className={formData.hostVideo ? 'icon-on' : 'icon-off'} />
              <span>Host Video: {formData.hostVideo ? "On" : "Off"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleMeeting;