/**
 * Room.jsx — WebRTC Video Room
 *
 * Uses native browser RTCPeerConnection (no simple-peer dependency).
 * Signaling is handled by Socket.IO events defined in amigo-backend/server.js.
 *
 * Backend API calls wired in Phase 4:
 *   • meetingAPI.end(roomId)           — called by host on End Call
 *   • recordingAPI.create(payload)     — called when a local recording is saved
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
  FaCircle, FaStop,
} from 'react-icons/fa';
import './styles/Room.css';
import { meetingAPI, recordingAPI } from '../services/api';

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
// RemoteVideo — isolated so each peer's stream gets its own ref.
// ---------------------------------------------------------------------------
const RemoteVideo = React.memo(({ peerId, peerName, streamRef }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef]);
  return (
    <div className="video-tile">
      <video
        ref={videoRef}
        autoPlay playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
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
    meetingId = null,          // DB primary key of the meeting (from NewMeeting/JoinMeeting)
    isHost    = false,         // true  → End Call calls meetingAPI.end()
    userName  = 'You',
    title     = `Room ${roomId}`,
    audio: initAudio = true,
    video: initVideo = true,
  } = location.state || {};

  // ── Refs (never cause re-renders) ──────────────────────────────────────
  const socketRef        = useRef(null);
  const myVideoRef       = useRef(null);
  const myStreamRef      = useRef(null);
  const isCleanedUp      = useRef(false);
  const hasEndedMeeting  = useRef(false);   // guard: API called at most once
  const chatBottomRef    = useRef(null);
  const meetingStartRef  = useRef(Date.now()); // for elapsed-duration tracking

  // pcsRef: Map<peerId, { pc: RTCPeerConnection, streamRef: { current: MediaStream } }>
  const pcsRef = useRef(new Map());

  // ── Recording refs ─────────────────────────────────────────────────────
  const mediaRecorderRef   = useRef(null);
  const recordedChunksRef  = useRef([]);
  const recordingStartRef  = useRef(null);  // Date when recording started

  // ── State ──────────────────────────────────────────────────────────────
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
  const [isRecording, setIsRecording]       = useState(false);
  const [recordingSaving, setRecordingSaving] = useState(false);
  const [endingCall, setEndingCall]         = useState(false);   // disables End btn
  const [recordingError, setRecordingError] = useState('');

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll chat ───────────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── WebRTC helpers (unchanged from original) ───────────────────────────
  const createPC = useCallback((peerId, peerName, localStream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    const streamRef = { current: new MediaStream() };
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach(track => streamRef.current.addTrack(track));
      setPeers(prev => prev.map(p => p.peerId === peerId ? { ...p, streamRef } : p));
    };
    pc.onicecandidate = (event) => {
      if (event.candidate && !isCleanedUp.current)
        socketRef.current?.emit('ice-candidate', event.candidate, peerId);
    };
    pc.oniceconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(pc.iceConnectionState))
        console.warn(`[ICE] ${peerId} state: ${pc.iceConnectionState}`);
    };
    return { pc, streamRef };
  }, []);

  const addPeer = useCallback((peerId, peerName, localStream) => {
    if (pcsRef.current.has(peerId)) return null;
    const { pc, streamRef } = createPC(peerId, peerName, localStream);
    pcsRef.current.set(peerId, { pc, streamRef });
    setPeers(prev => [...prev, { peerId, peerName, streamRef }]);
    return pc;
  }, [createPC]);

  const removePeer = useCallback((peerId) => {
    const entry = pcsRef.current.get(peerId);
    if (entry) {
      try { entry.pc.close(); } catch (_) {}
      pcsRef.current.delete(peerId);
    }
    setPeers(prev => prev.filter(p => p.peerId !== peerId));
  }, []);

  // ── Main Socket + Media Effect ─────────────────────────────────────────
  useEffect(() => {
    isCleanedUp.current = false;
    meetingStartRef.current = Date.now();

    const socket = io(SOCKET_SERVER, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    navigator.mediaDevices
      .getUserMedia({ video: initVideo, audio: initAudio })
      .then(async (stream) => {
        if (isCleanedUp.current) { stream.getTracks().forEach(t => t.stop()); return; }

        myStreamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        socket.emit('join-room', roomId, socket.id, userName);

        socket.on('user-connected', async (newUserId, newUserName) => {
          if (isCleanedUp.current) return;
          const pc = addPeer(newUserId, newUserName || 'Peer', stream);
          if (!pc) return;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', pc.localDescription, newUserId);
          } catch (err) { console.error('[offer]', err); }
        });

        socket.on('offer', async (incomingOffer, callerSocketId) => {
          if (isCleanedUp.current) return;
          const pc = addPeer(callerSocketId, 'Peer', stream);
          if (!pc) return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', pc.localDescription, callerSocketId);
          } catch (err) { console.error('[answer]', err); }
        });

        socket.on('answer', async (incomingAnswer, peerId) => {
          if (isCleanedUp.current) return;
          const entry = pcsRef.current.get(peerId);
          if (!entry || entry.pc.remoteDescription) return;
          try {
            await entry.pc.setRemoteDescription(new RTCSessionDescription(incomingAnswer));
          } catch (err) { console.warn('[answer setRemote]', err.message); }
        });

        socket.on('ice-candidate', async (candidate, peerId) => {
          if (isCleanedUp.current) return;
          const entry = pcsRef.current.get(peerId);
          if (!entry) return;
          try { await entry.pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (err) { console.warn('[ice]', err.message); }
        });

        socket.on('user-disconnected', (userId) => removePeer(userId));

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

    return () => {
      isCleanedUp.current = true;
      myStreamRef.current?.getTracks().forEach(t => t.stop());
      pcsRef.current.forEach(({ pc }) => { try { pc.close(); } catch (_) {} });
      pcsRef.current.clear();
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Control Handlers ───────────────────────────────────────────────────

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
    } catch (err) { console.error('Screen share failed:', err); }
  }, [screenShare, stopScreenShare]);

  // ── 🔴 Recording ─────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    const stream = myStreamRef.current;
    if (!stream) return;
    setRecordingError('');

    // Pick best supported MIME type
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ].find(t => MediaRecorder.isTypeSupported(t)) || '';

    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recordedChunksRef.current = [];
      recordingStartRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setRecordingSaving(true);
        const durationSecs = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        const blob         = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
        const fileSize     = blob.size;

        // ── Save a local download link AND notify the backend ──
        // NOTE: In production, upload `blob` to S3/GCS and use the returned URL.
        // For now we pass a blob:// URL — the backend stores only metadata.
        const localUrl = URL.createObjectURL(blob);

        // Trigger browser download automatically
        const a = document.createElement('a');
        a.href     = localUrl;
        a.download = `Amigo-${roomId}-${Date.now()}.webm`;
        a.click();

        // Save metadata to backend
        try {
          await recordingAPI.create({
            meetingId:  meetingId,
            title:      `Recording — ${title} (${new Date().toLocaleDateString()})`,
            duration:   durationSecs,
            fileSize:   fileSize,
            fileUrl:    localUrl,     // swap with real CDN URL post-upload
          });
        } catch (err) {
          console.error('Recording save failed:', err.message);
          setRecordingError('Recording downloaded but could not be saved to server.');
        } finally {
          setRecordingSaving(false);
          recordedChunksRef.current = [];
        }
      };

      recorder.start(1000); // collect a chunk every 1 second
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setRecordingError(`Recording failed to start: ${err.message}`);
    }
  }, [roomId, meetingId, title]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else             startRecording();
  }, [isRecording, startRecording, stopRecording]);

  // ── 📵 End / Leave Call ───────────────────────────────────────────────
  /**
   * handleEndCall:
   *   - If the user is the HOST   → calls meetingAPI.end(roomId) to mark it
   *     as ended in the database, then navigates away.
   *   - If the user is a GUEST    → skips the API call and just leaves.
   *   - Also stops any active recording before leaving.
   */
  const handleEndCall = useCallback(async () => {
    if (endingCall) return; // prevent double-click
    setEndingCall(true);

    // Stop recording if active
    if (isRecording) stopRecording();

    // Stop local media
    myStreamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();

    // Mark meeting as ended in DB (host only, called once per session)
    if (isHost && !hasEndedMeeting.current) {
      hasEndedMeeting.current = true;
      try {
        await meetingAPI.end(roomId);
      } catch (err) {
        // Non-fatal — meeting may already be ended or network issue
        console.error('[end-meeting] API call failed:', err.message);
      }
    }

    navigate('/dashboard');
  }, [endingCall, isHost, isRecording, navigate, roomId, stopRecording]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    socketRef.current?.emit('chat-message', trimmed, userName);
    setNewMessage('');
  }, [newMessage, userName]);

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

  // ── Media Error Screen ─────────────────────────────────────────────────
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

  // ── Elapsed time display ───────────────────────────────────────────────
  const elapsedMs   = Date.now() - meetingStartRef.current;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
  const elapsedStr  = `${String(elapsedMins).padStart(2,'0')}:${String(elapsedSecs).padStart(2,'0')}`;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="room-container">

      {/* 1. HEADER */}
      <header className="room-header">
        <div className="meeting-info">
          <span className="secure-badge"><FaVideo /> Secure</span>
          <span className="meeting-title">{title}</span>
          <span className="timer">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="header-controls">
          {/* Recording status indicator */}
          {isRecording && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <FaCircle style={{ fontSize: '0.6rem' }} /> REC {elapsedStr}
            </span>
          )}
          {recordingSaving && (
            <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>Saving recording...</span>
          )}
          {recordingError && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{recordingError}</span>
          )}
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
              autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
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
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{elapsedStr}</span>
          <span style={{ color: '#475569', fontSize: '0.65rem', marginLeft: '4px' }}>elapsed</span>
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

          {/* 🔴 Record Button */}
          <button
            className={`dock-btn ${isRecording ? 'danger' : ''}`}
            onClick={toggleRecording}
            disabled={recordingSaving}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
            style={isRecording ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
          >
            {isRecording ? <FaStop /> : <FaCircle style={{ color: '#ef4444' }} />}
            <span>{isRecording ? 'Stop Rec' : 'Record'}</span>
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

        {/* End / Leave button */}
        <div className="dock-group right">
          <button
            className="dock-btn end-call"
            onClick={handleEndCall}
            disabled={endingCall}
            title={isHost ? 'End Meeting for All' : 'Leave Meeting'}
          >
            <FaPhoneSlash />
            <span>{endingCall ? 'Ending...' : isHost ? 'End' : 'Leave'}</span>
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
                <span className="person-name">
                  {userName} (You)
                  {isHost && (
                    <span style={{
                      marginLeft: '6px', fontSize: '0.65rem', background: '#4f46e5',
                      color: '#fff', padding: '1px 6px', borderRadius: '99px',
                    }}>HOST</span>
                  )}
                </span>
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
