import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, 
  FaDesktop, FaPhoneSlash, FaComments, FaChevronRight, FaPaperPlane, FaExpand, FaCompress 
} from 'react-icons/fa';
import './styles/Room.css';

// Initialize Socket
// NOTE: Ensure this matches your backend URL exactly
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
  const streamRef = useRef();   
  const callMade = useRef(false); 
  const lastMessageRef = useRef(null);

  // --- STATE ---
  const [micOn, setMicOn] = useState(state?.micOn ?? true);
  const [videoOn, setVideoOn] = useState(state?.videoOn ?? true);
  const [screenShare, setScreenShare] = useState(false); 
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  // WebRTC State
  const [stream, setStream] = useState(null); 
  const [remoteStream, setRemoteStream] = useState(null); 
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [idToCall, setIdToCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 1. INITIALIZE MEDIA & SOCKET ---
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        streamRef.current = currentStream; 
        
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        socket.emit('join-room', { 
            roomId: meetingId, 
            userId: user?.id || 'guest', 
            userName: user?.fullName || 'Guest' 
        });
      })
      .catch((err) => console.error("Media Error:", err));

    // --- SOCKET LISTENERS ---
    
    socket.on('user-connected', ({ userName, socketId }) => {
        console.log("User Connected:", userName);
        setCallerName(userName);
        
        // Host calls automatically if stream is ready
        if (streamRef.current && !callMade.current) {
             callUser(socketId);
             callMade.current = true;
        } else {
             setIdToCall(socketId);
        }
    });

    socket.on('call-made', ({ from, name, signal }) => {
        console.log("Call Received from:", name);
        setCallAccepted(true);
        setCallerName(name);
        setIncomingCall({ callerId: from, signal });
    });

    socket.on('call-answered', ({ signal }) => {
        setCallAccepted(true);
        const peer = connectionRef.current;
        
        if (!peer || peer.destroyed) return;

        // Try to signal
        try {
            peer.signal(signal); 
        } catch (err) {
            // We also catch sync errors here
            console.warn("Peer signal handled safely (Sync):", err.message);
        }
    });

    socket.on('user-disconnected', () => {
        setCallEnded(true);
        setCallAccepted(false);
        callMade.current = false;
        setRemoteStream(null); 
        if(connectionRef.current) connectionRef.current.destroy();
    });

    return () => {
        socket.off('user-connected');
        socket.off('call-made');
        socket.off('call-answered');
        socket.off('user-disconnected');
    };
  }, [meetingId, user]);

  // --- 2. CHAT LISTENER ---
  useEffect(() => {
    const handleReceiveMessage = ({ message, userName, time }) => {
        const uniqueKey = `${userName}-${message}-${time}`;
        if (lastMessageRef.current === uniqueKey) return; 

        lastMessageRef.current = uniqueKey;
        setMessages((prev) => [...prev, { user: userName, text: message, time: time }]);
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => {
        socket.off('receive-message', handleReceiveMessage);
    };
  }, []); 

  // --- REMOTE VIDEO ATTACHER ---
  useEffect(() => {
    if (userVideo.current && remoteStream) {
        userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]); 

  // --- AUTO-ANSWER ---
  useEffect(() => {
    if (incomingCall && stream && !connectionRef.current) {
        answerCall(incomingCall.callerId, incomingCall.signal);
        setIncomingCall(null);
    }
  }, [incomingCall, stream]); 

  // --- AUTO-CALL ---
  useEffect(() => {
    if (idToCall && stream && !callMade.current) {
        callUser(idToCall);
        callMade.current = true;
        setIdToCall(null);
    }
  }, [idToCall, stream]);

  // --- MEDIA TOGGLES ---
  useEffect(() => {
    if(stream) {
        stream.getAudioTracks()[0].enabled = micOn;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && !screenShare) {
           videoTrack.enabled = videoOn;
        }
    }
  }, [micOn, videoOn, stream, screenShare]);


  // --- WEBRTC FUNCTIONS (THE FIX IS HERE) ---
  
  const callUser = (id) => {
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: streamRef.current
    });

    peer.on('signal', (data) => {
        socket.emit('call-user', {
            userToCall: id,
            signalData: data,
            from: socket.id,
            name: user?.fullName
        });
    });

    peer.on('stream', (currentRemoteStream) => {
        setRemoteStream(currentRemoteStream);
    });

    // FIX: Explicit Error Listener to prevent "Uncaught" crashes
    peer.on('error', (err) => {
        console.log("Peer Connection Error:", err.message);
        // If error is "stable", we just ignore it.
        if (err.code === 'ERR_WEBRTC_SUPPORT' || err.message.includes('stable')) {
            return;
        }
    });

    connectionRef.current = peer;
  };

  const answerCall = (callerId, signal) => {
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: streamRef.current
    });

    peer.on('signal', (data) => {
        socket.emit('answer-call', { signal: data, to: callerId });
    });

    peer.on('stream', (currentRemoteStream) => {
        setRemoteStream(currentRemoteStream);
    });

    // FIX: Explicit Error Listener for the Answerer side too
    peer.on('error', (err) => {
        console.log("Peer Connection Error (Answer):", err.message);
        if (err.code === 'ERR_WEBRTC_SUPPORT' || err.message.includes('stable')) {
            return;
        }
    });

    try {
        peer.signal(signal);
    } catch(err) {
        console.warn("Signal error in answer:", err);
    }
    
    connectionRef.current = peer;
  };

  // --- SCREEN SHARE ---
  const handleScreenShare = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((screenStream) => {
          setScreenShare(true);
          const screenTrack = screenStream.getTracks()[0];

          if (myVideo.current) {
            myVideo.current.srcObject = screenStream;
          }

          if (connectionRef.current && connectionRef.current._pc) {
            const sender = connectionRef.current._pc.getSenders().find((s) => s.track.kind === 'video');
            if (sender) sender.replaceTrack(screenTrack);
          }

          screenTrack.onended = () => {
             stopScreenShare();
          };
        })
        .catch((err) => {
            console.log("Failed to get screen", err);
            if (err.name === 'NotAllowedError') {
                 alert("Screen share permission denied.");
            }
        });
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
      setScreenShare(false);
      const currentStream = streamRef.current;
      if (currentStream) {
          const videoTrack = currentStream.getVideoTracks()[0];
          
          if (myVideo.current) {
              myVideo.current.srcObject = currentStream;
          }

          if (connectionRef.current && connectionRef.current._pc) {
              const sender = connectionRef.current._pc.getSenders().find((s) => s.track.kind === 'video');
              if (sender) sender.replaceTrack(videoTrack);
          }
      }
  };

  // --- UI HANDLERS ---
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
    
    const uniqueKey = `${user?.fullName || 'Guest'}-${newMessage}-${msgData.time}`;
    lastMessageRef.current = uniqueKey; 
    setMessages((prev) => [...prev, { user: 'You', text: newMessage, time: msgData.time }]);
    
    setNewMessage("");
  };

  const handleEndCall = () => {
    if(connectionRef.current) connectionRef.current.destroy();
    setCallEnded(true);
    callMade.current = false;
    setRemoteStream(null);
    
    if(streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    
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

  return (
    <div className="room-container">
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

      <main className={`main-stage ${sidePanelOpen ? 'shrink' : ''}`}>
        <div className="video-grid">
            
            {/* Local Video */}
            <div className="video-tile local-tile">
                 <div className="video-feed-sim">
                    <video 
                        playsInline 
                        muted 
                        ref={myVideo} 
                        autoPlay 
                        className={`video-element ${screenShare ? '' : 'mirror'}`} 
                    />
                    <span className="participant-label">You {screenShare && '(Presenting)'}</span>
                 </div>
            </div>

            {/* Remote Video */}
            {callAccepted && !callEnded ? (
                <div className="video-tile remote-tile">
                    <div className="video-feed-sim">
                        <video 
                            playsInline 
                            ref={userVideo} 
                            autoPlay 
                            className="video-element" 
                        />
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

      {/* Controls & Chat */}
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

          <button className={`dock-btn ${screenShare ? 'active' : ''}`} onClick={handleScreenShare}>
            <FaDesktop />
            <span>{screenShare ? 'Stop Share' : 'Share'}</span>
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