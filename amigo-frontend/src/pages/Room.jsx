import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, 
  FaDesktop, FaPhoneSlash, FaComments, FaUserFriends, 
  FaChevronRight, FaPaperPlane, FaSmile, FaExpand, FaCompress 
} from 'react-icons/fa';
import './styles/Room.css';

const Room = () => {
  const navigate = useNavigate();

  // --- UI STATE ---
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  // --- MOCK DATA ---
  const [messages, setMessages] = useState([
    { user: 'Sarah Jenks', text: 'Can everyone see my screen?', time: '10:02' },
    { user: 'Michael Chen', text: 'Yes, looking good!', time: '10:03' },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const participants = [
    { id: 1, name: 'You', isHost: true, video: true, audio: true },
    { id: 2, name: 'Sarah Jenks', isHost: false, video: true, audio: false },
    { id: 3, name: 'Michael Chen', isHost: false, video: false, audio: true }, // Video off example
    { id: 4, name: 'David Kim', isHost: false, video: true, audio: true },
  ];

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HANDLERS ---
  const toggleSidePanel = (tab) => {
    if (sidePanelOpen && activeTab === tab) {
      setSidePanelOpen(false); // Close if clicking same tab
    } else {
      setActiveTab(tab);
      setSidePanelOpen(true); // Open if closed or switching tabs
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { user: 'You', text: newMessage, time: 'Now' }]);
    setNewMessage("");
  };

  const handleEndCall = () => {
    // In real app: cleanup WebRTC streams here
    navigate('/dashboard');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="room-container">
      
      {/* --- 1. Top Info Bar (Minimal) --- */}
      <header className="room-header">
        <div className="meeting-info">
          <span className="secure-badge"><FaVideo /> Secure</span>
          <span className="meeting-title">Amigo Strategy Sync</span>
          <span className="timer">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="header-controls">
          <button className="btn-layout">View</button>
          <button className="btn-fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </header>

      {/* --- 2. Main Stage (Video Grid) --- */}
      <main className={`main-stage ${sidePanelOpen ? 'shrink' : ''}`}>
        <div className="video-grid">
          {participants.map((p) => (
            <div key={p.id} className="video-tile">
              {p.video ? (
                <div className={`video-feed-sim user-${p.id}`}>
                  {/* Simulated colorful video feed bg */}
                  <span className="participant-label">
                    {p.name} {p.audio ? '' : <FaMicrophoneSlash className="mic-off-icon"/>}
                  </span>
                </div>
              ) : (
                <div className="video-placeholder">
                  <div className="avatar-circle">{p.name.charAt(0)}</div>
                  <span className="participant-label">{p.name}</span>
                </div>
              )}
              {/* Active Speaker Border (Simulation) */}
              {p.id === 2 && <div className="active-speaker-border"></div>}
            </div>
          ))}
        </div>
      </main>

      {/* --- 3. Floating Control Dock --- */}
      <div className="control-dock">
        <div className="dock-group left">
          <div className="clock-mobile">10:45</div>
        </div>

        <div className="dock-group center">
          <button 
            className={`dock-btn ${!micOn ? 'danger' : ''}`} 
            onClick={() => setMicOn(!micOn)}
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            <span>{micOn ? 'Mute' : 'Unmute'}</span>
          </button>
          
          <button 
            className={`dock-btn ${!videoOn ? 'danger' : ''}`} 
            onClick={() => setVideoOn(!videoOn)}
          >
            {videoOn ? <FaVideo /> : <FaVideoSlash />}
            <span>{videoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          <button 
            className={`dock-btn ${screenShare ? 'active' : ''}`} 
            onClick={() => setScreenShare(!screenShare)}
          >
            <FaDesktop />
            <span>Share</span>
          </button>

          <button 
            className={`dock-btn ${sidePanelOpen && activeTab === 'participants' ? 'active' : ''}`} 
            onClick={() => toggleSidePanel('participants')}
          >
            <FaUserFriends />
            <span>People</span>
            <span className="badge-count">4</span>
          </button>

          <button 
            className={`dock-btn ${sidePanelOpen && activeTab === 'chat' ? 'active' : ''}`} 
            onClick={() => toggleSidePanel('chat')}
          >
            <FaComments />
            <span>Chat</span>
          </button>
        </div>

        <div className="dock-group right">
          <button className="dock-btn end-call" onClick={handleEndCall}>
            <FaPhoneSlash />
            <span>End</span>
          </button>
        </div>
      </div>

      {/* --- 4. Side Panel (Chat/Participants) --- */}
      <aside className={`side-panel ${sidePanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>{activeTab === 'chat' ? 'Meeting Chat' : 'Participants (4)'}</h3>
          <button className="btn-close-panel" onClick={() => setSidePanelOpen(false)}>
            <FaChevronRight />
          </button>
        </div>

        {/* CONTENT: Chat */}
        {activeTab === 'chat' && (
          <div className="panel-content chat-mode">
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.user === 'You' ? 'mine' : 'theirs'}`}>
                  <div className="bubble-meta">
                    <span className="sender">{msg.user}</span>
                    <span className="time">{msg.time}</span>
                  </div>
                  <div className="bubble-text">{msg.text}</div>
                </div>
              ))}
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn-send"><FaPaperPlane /></button>
            </form>
          </div>
        )}

        {/* CONTENT: Participants */}
        {activeTab === 'participants' && (
          <div className="panel-content people-mode">
            {participants.map(p => (
              <div key={p.id} className="person-row">
                <div className="person-info">
                  <div className="person-avatar">{p.name.charAt(0)}</div>
                  <span className="person-name">{p.name} {p.isHost && '(Host)'}</span>
                </div>
                <div className="person-status">
                  {p.video ? <FaVideo className="icon-on"/> : <FaVideoSlash className="icon-off"/>}
                  {p.audio ? <FaMicrophone className="icon-on"/> : <FaMicrophoneSlash className="icon-off"/>}
                </div>
              </div>
            ))}
            
            <div className="invite-section">
              <button className="btn-invite-link">Copy Invite Link</button>
            </div>
          </div>
        )}
      </aside>

    </div>
  );
};

export default Room;