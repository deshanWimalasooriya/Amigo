import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, 
  FaPhoneSlash, FaComments, FaChevronRight, FaPaperPlane, FaExpand, FaCompress 
} from 'react-icons/fa';
import './styles/Room.css';

// Initialize Socket
const socket = io('http://localhost:5000'); 

const Room = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const { user } = useAuth(); 
  const { state } = useLocation(); 

  // --- REFS ---
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // --- STATE ---
  const [micOn, setMicOn] = useState(state?.micOn ?? true);
  const [videoOn, setVideoOn] = useState(state?.videoOn ?? true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  // WebRTC State
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [idToCall, setIdToCall] = useState(null);
  
  // 🚨 NEW: Call Queue State (Fixes the error)
  const [incomingCall, setIncomingCall] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 1. INITIALIZE WEB RTC ---
  useEffect(() => {
    // A. Get Local Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // B. Join Room (Only after we have a stream)
        socket.emit('join-room', { 
            roomId: meetingId, 
            userId: user?.id || 'guest', 
            userName: user?.fullName || 'Guest' 
        });
      })
      .catch((err) => console.error("Media Error:", err));

    // --- SOCKET LISTENERS ---

    // Host Logic: Detect new user
    socket.on('user-connected', ({ userName, socketId }) => {
        console.log("User Connected:", userName);
        setCallerName(userName);
        setIdToCall(socketId);
    });

    // Guest Logic: Detect incoming call
    socket.on('call-made', ({ from, name, signal }) => {
        console.log("Call Received from:", name);
        setCallAccepted(true);
        setCallerName(name);
        setOtherUserSocketId(from);
        
        // 🚨 FIX: Don't answer immediately. Store it.
        // The new useEffect below will handle it when stream is ready.
        setIncomingCall({ callerId: from, signal });
    });

    socket.on('call-answered', ({ signal }) => {
        setCallAccepted(true);
        if(connectionRef.current) {
            connectionRef.current.signal(signal);
        }
    });

    socket.on('user-disconnected', () => {
        setCallEnded(true);
        setCallAccepted(false);
        if(connectionRef.current) connectionRef.current.destroy();
        window.location.reload(); 
    });

    socket.on('receive-message', ({ message, userName, time }) => {
        setMessages((prev) => [...prev, { user: userName, text: message, time: time }]);
    });

    return () => {
        socket.off('user-connected');
        socket.off('call-made');
        socket.off('call-answered');
        socket.off('user-disconnected');
        socket.off('receive-message');
    };
  }, [meetingId, user]);

  // --- 🚨 NEW: AUTO-ANSWER EFFECT ---
  // This watches for both 'stream' AND 'incomingCall'. 
  // It only runs when BOTH are ready.
  useEffect(() => {
    if (incomingCall && stream && !connectionRef.current) {
        console.log("Stream is ready. Answering call now...");
        answerCall(incomingCall.callerId, incomingCall.signal);
        setIncomingCall(null); // Clear the queue
    }
  }, [incomingCall, stream]);

  // --- AUTO-CALL EFFECT (For Host) ---
  useEffect(() => {
    if (idToCall && stream) {
        console.log("Stream is ready. Calling user now...");
        callUser(idToCall);
        setIdToCall(null); // Clear ID so we don't call twice
    }
  }, [idToCall, stream]);

  // --- WEBRTC FUNCTIONS ---

  const callUser = (id) => {
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
    });

    peer.on('signal', (data) => {
        socket.emit('call-user', {
            userToCall: id,
            signalData: data,
            from: socket.id,
            name: user?.fullName
        });
    });

    peer.on('stream', (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    connectionRef.current = peer;
  };

  const answerCall = (callerId, signal) => {
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
    });

    peer.on('signal', (data) => {
        socket.emit('answer-call', { signal: data, to: callerId });
    });

    peer.on('stream', (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    peer.signal(signal);
    connectionRef.current = peer;
  };

  // --- UI HANDLERS ---
  const [otherUserSocketId, setOtherUserSocketId] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
        roomId: meetingId,
        message: newMessage,
        userName: user?.fullName || 'Guest',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send-message', msgData);
    setMessages((prev) => [...prev, { user: 'You', text: newMessage, time: msgData.time }]);
    setNewMessage("");
  };

  const handleEndCall = () => {
    if(connectionRef.current) connectionRef.current.destroy();
    setCallEnded(true);
    if(stream) stream.getTracks().forEach(track => track.stop());
    navigate('/dashboard');
    window.location.reload(); 
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

  // Toggles
  useEffect(() => {
    if(stream) {
        stream.getAudioTracks()[0].enabled = micOn;
        stream.getVideoTracks()[0].enabled = videoOn;
    }
  }, [micOn, videoOn, stream]);

  return (
    <div className="room-container">
      
      {/* Header */}
      <header className="room-header">
        <div className="meeting-info">
          <span className="secure-badge"><FaVideo /> Secure</span>
          <span className="meeting-title">ID: {meetingId}</span>
          <span className="timer">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="header-controls">
          <button className="btn-fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </header>

      {/* Main Stage */}
      <main className={`main-stage ${sidePanelOpen ? 'shrink' : ''}`}>
        <div className="video-grid">
            
            {/* Local Video */}
            <div className="video-tile local-tile">
                 <div className="video-feed-sim">
                    <video playsInline muted ref={myVideo} autoPlay className="video-element mirror" />
                    <span className="participant-label">You</span>
                 </div>
            </div>

            {/* Remote Video */}
            {callAccepted && !callEnded ? (
                <div className="video-tile remote-tile">
                    <div className="video-feed-sim">
                        <video playsInline ref={userVideo} autoPlay className="video-element" />
                        <span className="participant-label">{callerName || "Remote User"}</span>
                    </div>
                </div>
            ) : (
                /* Waiting State */
                (idToCall || callerName) && !callAccepted && (
                    <div className="video-tile placeholder-tile">
                        <div className="video-placeholder">
                             <h3>Connecting to {callerName}...</h3>
                             <div className="loading-spinner"></div>
                        </div>
                    </div>
                )
            )}
        </div>
      </main>

      {/* Control Dock */}
      <div className="control-dock">
        <div className="dock-group center">
          <button className={`dock-btn ${!micOn ? 'danger' : ''}`} onClick={() => setMicOn(!micOn)}>
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            <span>{micOn ? 'Mute' : 'Unmute'}</span>
          </button>
          <button className={`dock-btn ${!videoOn ? 'danger' : ''}`} onClick={() => setVideoOn(!videoOn)}>
            {videoOn ? <FaVideo /> : <FaVideoSlash />}
            <span>{videoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
          <button className={`dock-btn ${sidePanelOpen && activeTab === 'chat' ? 'active' : ''}`} onClick={() => {setActiveTab('chat'); setSidePanelOpen(!sidePanelOpen)}}>
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

      {/* Side Panel */}
      <aside className={`side-panel ${sidePanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Chat</h3>
          <button className="btn-close-panel" onClick={() => setSidePanelOpen(false)}>
            <FaChevronRight />
          </button>
        </div>

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
      </aside>

    </div>
  );
};

export default Room;