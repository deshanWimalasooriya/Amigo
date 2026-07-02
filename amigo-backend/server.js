require('dotenv').config();
<<<<<<< HEAD
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require("./api/models");

// Initialize App
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARE ---
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ status: '✅ Amigo Backend running', version: '2.0' }));

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});

notifCtrl.setIo(io);
notifCtrl.startReminderCron();

=======
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const db           = require('./api/models');

// ── Route imports ─────────────────────────────────────────────────────────
const authRoutes      = require('./api/routes/authRoutes');
const meetingRoutes   = require('./api/routes/meetingRoutes');
const recordingRoutes = require('./api/routes/recordingRoutes');
const teamRoutes      = require('./api/routes/teamRoutes');

// ── App Init ──────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://amigo-teal.vercel.app',
  'https://amigo-ashy-rho.vercel.app',
  'https://amigo-git-master-ravindu56s-projects.vercel.app',
  'https://amigo-df3s7ag6i-ravindu56s-projects.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(cookieParser());

// ── REST API Routes ───────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/meetings',   meetingRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/teams',      teamRoutes);

app.get('/', (req, res) => {
  res.json({ status: '✅ Amigo Backend is running!', version: '2.0' });
});

// ── Socket.IO — WebRTC Signaling ──────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
});

// rooms: { roomId: { socketId: { socketId, userName } } }
>>>>>>> ravindu/master
const rooms = {};

io.on('connection', (socket) => {
  console.log(`⚡ New connection: ${socket.id}`);

<<<<<<< HEAD
  socket.on('register-user', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('join-room', (roomId, _clientUserId, userName) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];

    // First person in the room is the host
    const isHost = rooms[roomId].length === 0;
    rooms[roomId].push({ socketId: socket.id, userName, isHost });

    console.log(`✅ ${userName}${isHost ? ' [HOST]' : ''} joined room [${roomId}] — ${rooms[roomId].length} user(s)`);

    socket.to(roomId).emit('user-connected', socket.id, userName, false);

    const others = rooms[roomId].filter((user) => user.socketId !== socket.id);
    socket.emit('room-participants', others);

    socket.on('offer', (offer, targetSocketId) => {
      const sender = rooms[roomId]?.find((user) => user.socketId === socket.id);
      const senderName = sender?.userName || userName;
      const senderIsHost = sender?.isHost || false;
      io.to(targetSocketId).emit('offer', offer, socket.id, senderName, senderIsHost);
    });

    socket.on('answer', (answer, targetSocketId) => {
      io.to(targetSocketId).emit('answer', answer, socket.id);
    });

    socket.on('ice-candidate', (candidate, targetSocketId) => {
      io.to(targetSocketId).emit('ice-candidate', candidate, socket.id);
    });

    socket.on('chat-message', (message, senderName) => {
      io.in(roomId).emit('chat-message', message, senderName, socket.id);
    });

    socket.on('toggle-audio', (isMuted) => {
      socket.to(roomId).emit('peer-audio-toggle', socket.id, isMuted);
    });

    socket.on('toggle-video', (isOff) => {
      socket.to(roomId).emit('peer-video-toggle', socket.id, isOff);
    });

    socket.on('screen-share-started', () => {
      socket.to(roomId).emit('peer-screen-share-started', socket.id);
    });

    socket.on('screen-share-stopped', () => {
      socket.to(roomId).emit('peer-screen-share-stopped', socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${userName} left room [${roomId}]`);
      socket.to(roomId).emit('user-disconnected', socket.id);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((user) => user.socketId !== socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
      }
    });
  });

  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('call-made', { signal: signalData, from, name });
  });

  socket.on('answer-call', ({ signal, to }) => {
    io.to(to).emit('call-answered', { signal, answeredBy: socket.id });
  });

  socket.on('send-message', ({ roomId, message, userName, time }) => {
    io.to(roomId).emit('receive-message', { message, userName, time });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id);
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced (alter mode).'))
  .catch((err) => console.error('❌ DB sync failed:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n==================================================');
  console.log(`🚀 Server  | Amigo Backend running on PORT: ${PORT}`);
  console.log(`🔗 Server  | URL: http://localhost:${PORT}`);
  console.log(`⚙️  Config  | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebRTC  | Socket.IO Signaling is ACTIVE`);
  console.log('==================================================\n');
  console.log('   Auth          → /api/auth');
  console.log('   Meetings      → /api/meetings');
  console.log('   Recordings    → /api/recordings');
  console.log('   Teams         → /api/teams');
  console.log('   Notifications → /api/notifications');
  console.log('   Users         → /api/users');
});

=======
  socket.on('join-room', (roomId, userName) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = { socketId: socket.id, userName };

    const others = Object.values(rooms[roomId]).filter(u => u.socketId !== socket.id);
    console.log(`✅ ${userName} [${socket.id}] joined [${roomId}] — ${Object.keys(rooms[roomId]).length} user(s)`);

    // Tell the NEW joiner about everyone already in the room
    socket.emit('room-participants', others);

    // Tell EXISTING peers a new user joined (send new user's socketId + name)
    socket.to(roomId).emit('user-connected', socket.id, userName);
  });

  // Relay offer: sender sends { offer, targetSocketId, callerName }
  // Server forwards to target with sender's socket.id so target can reply
  socket.on('offer', (offer, targetSocketId, callerName) => {
    io.to(targetSocketId).emit('offer', offer, socket.id, callerName);
  });

  socket.on('answer', (answer, targetSocketId) => {
    io.to(targetSocketId).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (candidate, targetSocketId) => {
    io.to(targetSocketId).emit('ice-candidate', candidate, socket.id);
  });

  socket.on('chat-message', (message, senderName, roomId) => {
    io.in(roomId).emit('chat-message', message, senderName, socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    // Find which room this socket was in and notify peers
    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId][socket.id]) {
        const { userName } = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];
        console.log(`❌ ${userName} left room [${roomId}]`);
        io.to(roomId).emit('user-disconnected', socket.id);
        if (Object.keys(rooms[roomId]).length === 0) delete rooms[roomId];
        break;
      }
    }
  });
});

// ── Database sync + Server start ──────────────────────────────────────────
db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced (alter mode).'))
  .catch(err => console.error('❌ DB sync failed:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Amigo backend running on http://localhost:${PORT}`);
  console.log(`   Auth       → /api/auth`);
  console.log(`   Meetings   → /api/meetings`);
  console.log(`   Recordings → /api/recordings`);
  console.log(`   Teams      → /api/teams`);
});
>>>>>>> ravindu/master
