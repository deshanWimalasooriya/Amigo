import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth Context
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaRocket, FaIdBadge, FaRandom } from 'react-icons/fa';
import './styles/NewMeeting.css';

const NewMeeting = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 2. Get Real User Data
  const videoRef = useRef(null); // Ref for accessing the video element

  // Host Configuration State
  const [config, setConfig] = useState({
    topic: user ? `${user.firstName}'s Instant Meeting` : "My Meeting",
    usePMI: false,
    passcode: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6 digit
    hostVideo: true,
    hostAudio: true
  });

  const [stream, setStream] = useState(null);

  // 3. Access Real Camera on Load
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

    // Cleanup: Stop tracks when leaving page (optional, or let Room take over)
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 4. Toggle Video/Audio Tracks Live
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) videoTrack.enabled = config.hostVideo;
      if (audioTrack) audioTrack.enabled = config.hostAudio;
    }
  }, [config.hostVideo, config.hostAudio, stream]);

  const toggleConfig = (key) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleStart = () => {
    // FIX: Use 'user.pmi' instead of 'user.meetingId'
    // If config.usePMI is true, use user.pmi. Otherwise, generate a random ID.
    const meetingId = config.usePMI 
        ? user?.pmi 
        : Math.floor(100000000 + Math.random() * 900000000).toString();
    
    // Safety Check: If ID is somehow missing, alert the user
    if (!meetingId) {
        alert("Error: Could not retrieve Meeting ID. Please try again.");
        return;
    }

    // Navigate
    navigate(`/room/${meetingId}`, { 
      state: { 
        micOn: config.hostAudio,
        videoOn: config.hostVideo,
        isHost: true
      } 
    });
  };

  return (
    <div className="launch-wrapper">
      <Header />

      <div className="launch-container">
        
        {/* --- LEFT: Host Configuration --- */}
        <div className="launch-panel">
          <div className="panel-header">
            <div className="icon-badge orange"><FaRocket /></div>
            <h2>Start New Meeting</h2>
            <p>Configure your instant meeting settings.</p>
          </div>

          <div className="config-form">
            
            {/* Topic */}
            <div className="form-group">
              <label>Meeting Topic</label>
              <input 
                type="text" 
                name="topic" 
                value={config.topic} 
                onChange={handleChange}
                className="topic-input"
              />
            </div>

            {/* Meeting ID Selection */}
            <div className="id-selection">
              <label className={`id-option ${!config.usePMI ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="idType" 
                  checked={!config.usePMI} 
                  onChange={() => setConfig({...config, usePMI: false})} 
                />
                <div className="radio-content">
                  <div className="radio-icon"><FaRandom /></div>
                  <div className="radio-text">
                    <span className="radio-title">Generate Automatically</span>
                    <span className="radio-desc">Secure, one-time meeting ID</span>
                  </div>
                </div>
              </label>

              <label className={`id-option ${config.usePMI ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="idType" 
                  checked={config.usePMI} 
                  onChange={() => setConfig({...config, usePMI: true})} 
                />
                <div className="radio-content">
                  <div className="radio-icon"><FaIdBadge /></div>
                  <div className="radio-text">
                    <span className="radio-title">Personal Meeting ID</span>
                    
                    {/* FIX: Use user.pmi here too */}
                    <span className="radio-desc">{user?.pmi || "Loading..."}</span>
                    
                  </div>
                </div>
              </label>
            </div>

            {/* Passcode Display */}
            <div className="passcode-row">
              <div className="passcode-label">Security Passcode</div>
              <div className="passcode-value">
                {config.usePMI ? "ALEX123" : config.passcode}
              </div>
            </div>

            {/* Start Button */}
            <div className="launch-action">
              <button className="btn-launch" onClick={handleStart}>
                Start Meeting
              </button>
              <p className="launch-hint">By starting, you agree to host responsibilities.</p>
            </div>

          </div>
        </div>

        {/* --- RIGHT: Tech Preview (Host Mode) --- */}
        <div className="preview-panel-host">
          <div className="preview-label">HOST PREVIEW</div>
          
          <div className="host-camera-card">
            
            {/* Video Feed */}
            <div className="video-feed">
                {/* 7. REAL VIDEO ELEMENT */}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className={`real-video-preview ${!config.hostVideo ? 'hidden' : ''}`}
                />

                {/* Avatar Fallback */}
                {!config.hostVideo && (
                    <div className="host-avatar">
                        {user?.firstName ? user.firstName.charAt(0) : 'U'}
                    </div>
                )}

                {/* Overlay Controls */}
                <div className="feed-overlay">
                    <button 
                        className={`overlay-btn ${config.hostAudio ? '' : 'btn-off'}`}
                        onClick={() => toggleConfig('hostAudio')}
                    >
                        {config.hostAudio ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button 
                        className={`overlay-btn ${config.hostVideo ? '' : 'btn-off'}`}
                        onClick={() => toggleConfig('hostVideo')}
                    >
                        {config.hostVideo ? <FaVideo /> : <FaVideoSlash />}
                    </button>
                </div>
            </div>

            <div className="card-footer">
              <div className="status-text">
                <span className={`dot ${config.hostVideo && config.hostAudio ? 'green' : 'red'}`}></span>
                {config.hostVideo ? "System Ready" : "Video Paused"}
              </div>
              <div className="volume-slider">
                <div className="volume-track">
                    <div className="volume-level" style={{width: config.hostAudio ? '70%' : '0%'}}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NewMeeting;