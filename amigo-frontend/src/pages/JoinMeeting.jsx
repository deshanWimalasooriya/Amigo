<<<<<<< HEAD
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
=======
/**
 * JoinMeeting.jsx — Tailwind rebuild, real camera preview, CSS purged
 */
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash,
  FaSignInAlt, FaKeyboard,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { meetingAPI } from '../services/api';

const JoinMeeting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
>>>>>>> ravindu/master

  const [roomId,    setRoomId]    = useState(location.state?.roomId || '');
  const [passcode,  setPasscode]  = useState('');
  const [camOn,     setCamOn]     = useState(true);
  const [micOn,     setMicOn]     = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [camReady,  setCamReady]  = useState(false);

<<<<<<< HEAD
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
=======
  // Real camera preview — stopped on unmount
  useEffect(() => {
    let active = true;
    if (camOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCamReady(true);
        })
        .catch(() => setCamReady(false));
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamReady(false);
    }
    return () => { active = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [camOn]);

  const handleJoin = async () => {
    if (!roomId.trim()) { setError('Please enter a Room ID.'); return; }
    setLoading(true); setError('');
    try {
      const meeting = await meetingAPI.join(roomId.trim(), passcode.trim());
      streamRef.current?.getTracks().forEach(t => t.stop()); // stop preview
      navigate(`/room/${meeting.roomId}`, {
        state: { meetingId: meeting.id, title: meeting.title, isHost: false,
                 userName: user?.fullName || 'Guest',
                 audio: micOn, video: camOn },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
>>>>>>> ravindu/master
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="flex-1 page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* ── LEFT: Join form ── */}
          <div className="card space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-mint-100 text-mint-600
                              flex items-center justify-center text-lg">
                <FaKeyboard />
              </div>
              <div>
                <h2 className="page-title">Join a Meeting</h2>
                <p className="page-desc">Enter the room ID to join</p>
              </div>
            </div>

            <div>
              <label className="input-label">Room ID</label>
              <input type="text" placeholder="e.g. ABC-123-XYZ"
                value={roomId} onChange={e => setRoomId(e.target.value)}
                className="input font-mono tracking-widest" />
            </div>

            <div>
              <label className="input-label">Passcode <span className="text-charcoal-400">(optional)</span></label>
              <input type="password" placeholder="Enter passcode if required"
                value={passcode} onChange={e => setPasscode(e.target.value)}
                className="input" />
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button onClick={handleJoin} disabled={loading}
              className="btn-accent w-full py-3 text-base">
              {loading ? <><span className="spinner" /> Joining…</> : <><FaSignInAlt /> Join Meeting</>}
            </button>
          </div>

<<<<<<< HEAD
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
=======
          {/* ── RIGHT: Preview ── */}
          <div className="card flex flex-col gap-5">
            <div>
              <h3 className="section-title">Your Preview</h3>
              <p className="section-subtitle">How you'll appear when you join</p>
            </div>

            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video
                            flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover transition-opacity duration-300
                            ${camOn && camReady ? 'opacity-100' : 'opacity-0'}`} />
              {(!camOn || !camReady) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center
                                  text-2xl font-bold text-white">
                    {user?.fullName?.charAt(0) || 'G'}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {camOn ? 'Connecting camera…' : 'Camera off'}
                  </p>
>>>>>>> ravindu/master
                </div>
              )}
            </div>

<<<<<<< HEAD
            <div className="camera-footer">
              <p>{settings.video ? "Camera is Ready" : "Camera is Off"}</p>
              <button className="btn-test-device" type="button">Test Speaker and Microphone</button>
=======
            <div className="flex gap-3">
              <button onClick={() => setCamOn(v => !v)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-semibold transition-all duration-200
                            ${ camOn ? 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                                     : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
                {camOn ? <FaVideo /> : <FaVideoSlash />}
                {camOn ? 'Camera On' : 'Camera Off'}
              </button>
              <button onClick={() => setMicOn(v => !v)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-semibold transition-all duration-200
                            ${ micOn ? 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                                     : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
                {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                {micOn ? 'Mic On' : 'Mic Off'}
              </button>
>>>>>>> ravindu/master
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JoinMeeting;
