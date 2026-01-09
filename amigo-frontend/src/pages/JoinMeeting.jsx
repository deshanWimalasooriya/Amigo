import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth
import { FaKeyboard, FaUser, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaArrowRight } from 'react-icons/fa';
import './styles/JoinMeeting.css';

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 2. Get User Info
  const videoRef = useRef(null); // Ref for video element

  // State
  const [formData, setFormData] = useState({
    meetingId: '',
    username: user?.fullName || 'Guest User', // Autofill Name
  });

  const [settings, setSettings] = useState({
    audio: true,
    video: true
  });

  const [stream, setStream] = useState(null);

  // 3. Access Real Camera (Tech Check)
  useEffect(() => {
    const getMedia = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
      }
    };

    getMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 4. Toggle Tracks Live (So you see the effect immediately)
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) videoTrack.enabled = settings.video;
      if (audioTrack) audioTrack.enabled = settings.audio;
    }
  }, [settings.video, settings.audio, stream]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSetting = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!formData.meetingId) return;

    // 5. Navigate to the Real Room
    navigate(`/room/${formData.meetingId}`, { 
        state: { 
            micOn: settings.audio,
            videoOn: settings.video,
            userName: formData.username // Pass updated name if they changed it
        } 
    });
  };

  return (
    <div className="join-wrapper">
      <Header />

      <div className="join-container">
        
        {/* --- LEFT: Input Section --- */}
        <div className="join-form-panel">
          <div className="panel-header">
            <div className="icon-badge blue"><FaKeyboard /></div>
            <h2>Join Meeting</h2>
            <p>Enter the code provided by the meeting host.</p>
          </div>

          <form onSubmit={handleJoin}>
            
            {/* Meeting ID Input */}
            <div className="form-group large-input">
              <label>Meeting ID or Personal Link Name</label>
              <div className="input-icon-wrapper">
                <input 
                  type="text" 
                  name="meetingId" 
                  value={formData.meetingId} 
                  onChange={handleChange} 
                  placeholder="e.g. 844-922-101" 
                  autoFocus
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label>Your Display Name</label>
              <div className="input-icon-wrapper">
                <FaUser className="field-icon" />
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="Your Name" 
                  required
                />
              </div>
            </div>

            {/* Audio/Video Options */}
            <div className="device-toggles">
              <p className="toggles-title">Join Options</p>
              
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-name">Don't connect to audio</span>
                  <span className="toggle-desc">Join without microphone audio</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={!settings.audio} 
                    onChange={() => toggleSetting('audio')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-name">Turn off my video</span>
                  <span className="toggle-desc">Join with camera off</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={!settings.video} 
                    onChange={() => toggleSetting('video')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button 
                type="submit" 
                className={`btn-join ${formData.meetingId ? 'active' : ''}`}
                disabled={!formData.meetingId}
              >
                Join Meeting <FaArrowRight />
              </button>
            </div>
          </form>
        </div>

        {/* --- RIGHT: Tech Check Preview --- */}
        <div className="tech-check-panel">
          <div className="preview-label">PRE-FLIGHT CHECK</div>
          
          <div className="camera-card">
            {/* The Screen Area */}
            <div className={`video-screen ${!settings.video ? 'video-off' : ''}`}>
              
              {/* REAL VIDEO FEED */}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`real-video-preview ${!settings.video ? 'hidden' : ''}`}
              />

              {/* Avatar Fallback */}
              {!settings.video && (
                <div className="avatar-placeholder">
                  {formData.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="status-badges">
                <span className={`badge ${settings.audio ? 'on' : 'off'}`}>
                  {settings.audio ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </span>
                <span className={`badge ${settings.video ? 'on' : 'off'}`}>
                  {settings.video ? <FaVideo /> : <FaVideoSlash />}
                </span>
              </div>
            </div>

            <div className="camera-footer">
              <p>{settings.video ? "Camera is Ready" : "Camera is Off"}</p>
              <button className="btn-test-device" type="button">Test Speaker and Microphone</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JoinMeeting;