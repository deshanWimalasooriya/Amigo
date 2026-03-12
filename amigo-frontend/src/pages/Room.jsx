/**
 * Room.jsx — WebRTC Video Room
 *
 * Uses native browser RTCPeerConnection (no simple-peer dependency).
 * Signaling is handled by Socket.IO events defined in amigo-backend/server.js.
 *
 * Signal flow:
 *   Existing user (caller)  ─── offer  ──►  New user (answerer)
 *   New user (answerer)     ─── answer ──►  Existing user (caller)
 *   Both peers              ◄── ice-candidate ──► Both peers
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaDesktop, FaPhoneSlash, FaComments, FaUserFriends,
  FaChevronRight, FaPaperPlane, FaExpand, FaCompress,
} from 'react-icons/fa';
import './styles/Room.css';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const SOCKET_SERVER = import.meta.env.VITE_SOCKET_SERVER || 'http://localhost:5000';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ---------------------------------------------------------------------------
// RemoteVideo — isolated component so each peer's stream gets its own ref.
// MUST be defined outside Room so React does not recreate it on every
// parent re-render (which would wipe the srcObject and black out the video).
// ---------------------------------------------------------------------------
const RemoteVideo = React.memo(({ peerId, peerName, streamRef }) => {
  const videoRef = useRef(null);

  // Attach the stream as soon as this tile mounts or the stream changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef]);

  return (
    <div className="video-tile">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', borderRadius: '12px',
        }}
      />
      <span className="participant-label">{peerName}</span>
    </div>
  );
});
RemoteVideo.displayName = 'RemoteVideo';

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const Room = () => {
  const navigate   = useNavigate();
  const { roomId } = useParams();
  const location   = useLocation();

  const {
    userName  = 'You',
    audio: initAudio = true,
    video: initVideo = true,
  } = location.state || {};

  // ── Refs (never cause re-renders) ────────────────────────────────────────
  const socketRef     = useRef(null);
  const myVideoRef    = useRef(null);
  const myStreamRef   = useRef(null);
  const isCleanedUp   = useRef(false);
  const chatBottomRef = useRef(null);

  // pcsRef: Map<peerId, { pc: RTCPeerConnection, streamRef: { current: MediaStream } }>
  // Stored as a ref so signaling callbacks always see the latest Map
  // without needing to be inside state-update closures.
  const pcsRef = useRef(new Map());

  // ── State (cause re-renders) ─────────────────────────────────────────────
  // peers drives the RemoteVideo list:
  // [{ peerId, peerName, streamRef }]
  const [peers, setPeers]                   = useState([]);
  const [micOn, setMicOn]                   = useState(initAudio);
  const [videoOn, setVideoOn]               = useState(initVideo);
  const [screenShare, setScreenShare]       = useState(false);
  const [sidePanelOpen, setSidePanelOpen]   = useState(false);
  const [activeTab, setActiveTab]           = useState('chat');
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [messages, setMessages]             = useState([]);
  const [newMessage, setNewMessage]         = useState('');
  const [time, setTime]                     = useState(new Date());
  const [mediaError, setMediaError]         = useState(null);

  // ── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll chat ──────────────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Create a new RTCPeerConnection for `peerId`.
   * Attaches all necessary event handlers before any signaling begins.
   * Returns { pc, streamRef } so callers can store it in pcsRef.
   */
  const createPC = useCallback((peerId, peerName, localStream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    // A ref-based container for this peer's incoming stream.
    // Using a ref (not state) means updating the stream never
    // triggers a re-render of the whole Room — only RemoteVideo reads it.
    const streamRef = { current: new MediaStream() };

    // ── Add all local tracks to the connection ──
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // ── Receive remote tracks ──
    // ontrack fires once per remote track (audio + video separately).
    // We append each track to streamRef so RemoteVideo stays live.
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach(track => {
        streamRef.current.addTrack(track);
      });
      // If the video element already mounted, attach the stream directly.
      // This handles the case where ontrack fires after RemoteVideo mounts.
      setPeers(prev =>
        prev.map(p =>
          p.peerId === peerId ? { ...p, streamRef } : p
        )
      );
    };

    // ── Send ICE candidates to the remote peer via the signaling server ──
    pc.onicecandidate = (event) => {
      if (event.candidate && !isCleanedUp.current) {
        socketRef.current?.emit('ice-candidate', event.candidate, peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(pc.iceConnectionState)) {
        console.warn(`[ICE] ${peerId} state: ${pc.iceConnectionState}`);
      }
    };

    return { pc, streamRef };
  }, []);

  /**
   * Safely add a peer entry to both pcsRef and state.
   * Duplicate guard prevents double tiles on rapid re-joins.
   */
  const addPeer = useCallback((peerId, peerName, localStream) => {
    if (pcsRef.current.has(peerId)) return null;
    const { pc, streamRef } = createPC(peerId, peerName, localStream);
    pcsRef.current.set(peerId, { pc, streamRef });
    setPeers(prev => [...prev, { peerId, peerName, streamRef }]);
    return pc;
  }, [createPC]);

  /**
   * Close and remove a peer's connection + video tile.
   */
  const removePeer = useCallback((peerId) => {
    const entry = pcsRef.current.get(peerId);
    if (entry) {
      try { entry.pc.close(); } catch (_) {}
      pcsRef.current.delete(peerId);
    }
    setPeers(prev => prev.filter(p => p.peerId !== peerId));
  }, []);

  // ── Main Effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    isCleanedUp.current = false;

    // 1. Connect Socket.IO
    const socket = io(SOCKET_SERVER, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    // 2. Get local camera + mic
    navigator.mediaDevices
      .getUserMedia({ video: initVideo, audio: initAudio })
      .then(async (stream) => {
        if (isCleanedUp.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        myStreamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        // 3. Join the room
        socket.emit('join-room', roomId, socket.id, userName);

        // ── EVENT: New user joined AFTER us → we are the CALLER ──────────
        socket.on('user-connected', async (newUserId, newUserName) => {
          if (isCleanedUp.current) return;

          const pc = addPeer(newUserId, newUserName || 'Peer', stream);
          if (!pc) return; // duplicate guard fired

          try {
            // Create and send an SDP offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', pc.localDescription, newUserId);
          } catch (err) {
            console.error('[offer] Failed:', err);
          }
        });

        // ── EVENT: Receive an offer → we are the ANSWERER ────────────────
        socket.on('offer', async (incomingOffer, callerSocketId) => {
          if (isCleanedUp.current) return;

          const pc = addPeer(callerSocketId, 'Peer', stream);
          if (!pc) return;

          try {
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', pc.localDescription, callerSocketId);
          } catch (err) {
            console.error('[answer] Failed:', err);
          }
        });

        // ── EVENT: Receive an answer to our offer ────────────────────────
        socket.on('answer', async (incomingAnswer, peerId) => {
          if (isCleanedUp.current) return;
          const entry = pcsRef.current.get(peerId);
          if (!entry) return;
          try {
            // Only apply if we don't already have a remote description
            if (!entry.pc.remoteDescription) {
              await entry.pc.setRemoteDescription(
                new RTCSessionDescription(incomingAnswer)
              );
            }
          } catch (err) {
            console.warn('[answer] setRemoteDescription failed:', err.message);
          }
        });

        // ── EVENT: Receive ICE candidate ─────────────────────────────────
        socket.on('ice-candidate', async (candidate, peerId) => {
          if (isCleanedUp.current) return;
          const entry = pcsRef.current.get(peerId);
          if (!entry) return;
          try {
            await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            // Benign: can fire if the peer disconnected mid-negotiation
            console.warn('[ice-candidate] addIceCandidate failed:', err.message);
          }
        });

        // ── EVENT: A peer left ────────────────────────────────────────────
        socket.on('user-disconnected', (userId) => {
          removePeer(userId);
        });

        // ── EVENT: Chat messages ──────────────────────────────────────────
        socket.on('chat-message', (message, senderName, senderId) => {
          if (isCleanedUp.current) return;
          setMessages(prev => [...prev, {
            user: senderId === socket.id ? 'You' : senderName,
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mine: senderId === socket.id,
          }]);
        });
      })
      .catch(err => {
        console.error('getUserMedia error:', err);
        setMediaError(
          err.name === 'NotAllowedError'
            ? 'Camera/microphone access was denied. Please allow permissions and refresh.'
            : `Could not access media devices: ${err.message}`
        );
      });

    // ── Cleanup on unmount ────────────────────────────────────────────────
    return () => {
      isCleanedUp.current = true;
      myStreamRef.current?.getTracks().forEach(t => t.stop());
      pcsRef.current.forEach(({ pc }) => { try { pc.close(); } catch (_) {} });
      pcsRef.current.clear();
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Control Handlers ──────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    const track = myStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
    socketRef.current?.emit('toggle-audio', !track.enabled);
  }, []);

  const toggleVideo = useCallback(() => {
    const track = myStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
    socketRef.current?.emit('toggle-video', !track.enabled);
  }, []);

  const stopScreenShare = useCallback(() => {
    const camTrack = myStreamRef.current?.getVideoTracks()[0];
    pcsRef.current.forEach(({ pc }) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && camTrack) sender.replaceTrack(camTrack).catch(console.warn);
    });
    if (myVideoRef.current) myVideoRef.current.srcObject = myStreamRef.current;
    setScreenShare(false);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (screenShare) { stopScreenShare(); return; }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack  = screenStream.getVideoTracks()[0];
      pcsRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack).catch(console.warn);
      });
      if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
      setScreenShare(true);
      screenTrack.addEventListener('ended', stopScreenShare, { once: true });
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  }, [screenShare, stopScreenShare]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    socketRef.current?.emit('chat-message', trimmed, userName);
    setNewMessage('');
  }, [newMessage, userName]);

  const handleEndCall = useCallback(() => {
    myStreamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    navigate('/dashboard');
  }, [navigate]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const toggleSidePanel = useCallback((tab) => {
    setSidePanelOpen(prev => {
      if (prev && activeTab === tab) return false;
      setActiveTab(tab);
      return true;
    });
  }, [activeTab]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId)
      .then(() => alert(`Room ID copied: ${roomId}`))
      .catch(() => prompt('Copy this Room ID:', roomId));
  }, [roomId]);

  // ── Media Error Screen ────────────────────────────────────────────────────
  if (mediaError) {
    return (
      <div className="room-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          color: 'white', textAlign: 'center', padding: '2rem',
          background: '#1e293b', borderRadius: '12px', maxWidth: '500px',
        }}>
          <FaVideoSlash style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Cannot Access Camera / Microphone</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{mediaError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#4f46e5', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="room-container">

      {/* 1. HEADER */}
      <header className="room-header">
        <div className="meeting-info">
          <span className="secure-badge"><FaVideo /> Secure</span>
          <span className="meeting-title">Room: {roomId}</span>
          <span className="timer">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="header-controls">
          <button className="btn-fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </header>

      {/* 2. VIDEO GRID */}
      <main className={`main-stage ${sidePanelOpen ? 'shrink' : ''}`}>
        <div className="video-grid">

          {/* LOCAL TILE */}
          <div className="video-tile">
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', borderRadius: '12px',
              }}
            />
            <span className="participant-label">
              {userName} (You)
              {!micOn && <FaMicrophoneSlash className="mic-off-icon" />}
            </span>
            {!videoOn && (
              <div className="video-placeholder" style={{ position: 'absolute', inset: 0 }}>
                <div className="avatar-circle">{userName.charAt(0).toUpperCase()}</div>
              </div>
            )}
          </div>

          {/* REMOTE TILES */}
          {peers.map(({ peerId, peerName, streamRef }) => (
            <RemoteVideo
              key={peerId}
              peerId={peerId}
              peerName={peerName}
              streamRef={streamRef}
            />
          ))}

        </div>
      </main>

      {/* 3. CONTROL DOCK */}
      <div className="control-dock">
        <div className="dock-group left">
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="dock-group center">
          <button
            className={`dock-btn ${!micOn ? 'danger' : ''}`}
            onClick={toggleMic}
            title={micOn ? 'Mute' : 'Unmute'}
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            <span>{micOn ? 'Mute' : 'Unmute'}</span>
          </button>

          <button
            className={`dock-btn ${!videoOn ? 'danger' : ''}`}
            onClick={toggleVideo}
            title={videoOn ? 'Stop Video' : 'Start Video'}
          >
            {videoOn ? <FaVideo /> : <FaVideoSlash />}
            <span>{videoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          <button
            className={`dock-btn ${screenShare ? 'active' : ''}`}
            onClick={toggleScreenShare}
            title={screenShare ? 'Stop Share' : 'Share Screen'}
          >
            <FaDesktop />
            <span>{screenShare ? 'Stop Share' : 'Share'}</span>
          </button>

          <button
            className={`dock-btn ${sidePanelOpen && activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => toggleSidePanel('participants')}
            title="Participants"
          >
            <FaUserFriends />
            <span>People</span>
            <span className="badge-count">{peers.length + 1}</span>
          </button>

          <button
            className={`dock-btn ${sidePanelOpen && activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => toggleSidePanel('chat')}
            title="Chat"
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

      {/* 4. SIDE PANEL */}
      <aside className={`side-panel ${sidePanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>
            {activeTab === 'chat'
              ? 'Meeting Chat'
              : `Participants (${peers.length + 1})`}
          </h3>
          <button className="btn-close-panel" onClick={() => setSidePanelOpen(false)}>
            <FaChevronRight />
          </button>
        </div>

        {activeTab === 'chat' && (
          <div className="panel-content chat-mode">
            <div className="chat-messages">
              {messages.length === 0 && (
                <p style={{ color: '#475569', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
                  No messages yet. Say hello! 👋
                </p>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.mine ? 'mine' : 'theirs'}`}>
                  <div className="bubble-meta">
                    <span className="sender">{msg.user}</span>
                    <span className="time">{msg.time}</span>
                  </div>
                  <div className="bubble-text">{msg.text}</div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn-send"><FaPaperPlane /></button>
            </form>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="panel-content people-mode">
            <div className="person-row">
              <div className="person-info">
                <div className="person-avatar">{userName.charAt(0).toUpperCase()}</div>
                <span className="person-name">{userName} (You)</span>
              </div>
              <div className="person-status">
                {videoOn ? <FaVideo className="icon-on" /> : <FaVideoSlash className="icon-off" />}
                {micOn   ? <FaMicrophone className="icon-on" /> : <FaMicrophoneSlash className="icon-off" />}
              </div>
            </div>

            {peers.map(({ peerId, peerName }) => (
              <div key={peerId} className="person-row">
                <div className="person-info">
                  <div className="person-avatar">{(peerName || 'P').charAt(0).toUpperCase()}</div>
                  <span className="person-name">{peerName || 'Peer'}</span>
                </div>
              </div>
            ))}

            <div className="invite-section">
              <button className="btn-invite-link" onClick={copyRoomId}>Copy Room ID</button>
            </div>
          </div>
        )}
      </aside>

    </div>
  );
};

export default Room;
