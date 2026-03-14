require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const db           = require('./api/models');

const authRoutes         = require('./api/routes/authRoutes');
const meetingRoutes      = require('./api/routes/meetingRoutes');
const recordingRoutes    = require('./api/routes/recordingRoutes');
const teamRoutes         = require('./api/routes/teamRoutes');
const notificationRoutes = require('./api/routes/notificationRoutes');
const notifCtrl          = require('./api/controllers/notificationController');

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

app.use(cors({ origin: allowedOrigins, credentials: true, methods: ['GET','POST','PUT','DELETE','PATCH'] }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',          authRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/recordings',    recordingRoutes);
app.use('/api/teams',         teamRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.json({ status: '✅ Amigo Backend running', version: '2.0' }));

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET','POST'], credentials: true },
});

// Inject io into notification controller for real-time pushes
notifCtrl.setIo(io);
// Start 10-min reminder cron
notifCtrl.startReminderCron();

// Room tracking: { roomId: [{ socketId, userId, userName }] }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`⚡ New connection: ${socket.id}`);

  // Join a personal notification room so we can push to specific users
  socket.on('register-user', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, userId, userName });

    console.log(`✅ ${userName} joined room [${roomId}] — ${rooms[roomId].length} user(s)`);

    socket.to(roomId).emit('user-connected', userId, userName);

    const others = rooms[roomId].filter(u => u.socketId !== socket.id);
    socket.emit('room-participants', others);

    // WebRTC signaling — forward callerName so receiving side shows real name
    socket.on('offer', (offer, targetSocketId, callerName) => {
      io.to(targetSocketId).emit('offer', offer, socket.id, callerName || userName);
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
      socket.to(roomId).emit('user-disconnected', userId, socket.id);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
      }
    });
  });

  socket.on('disconnect', () => console.log(`❌ Disconnected: ${socket.id}`));
});

// ── DB sync + start ────────────────────────────────────────────────────────
db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced (alter mode).'))
  .catch(err => console.error('❌ DB sync failed:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Amigo backend running on http://localhost:${PORT}`);
  console.log(`   Auth          → /api/auth`);
  console.log(`   Meetings      → /api/meetings`);
  console.log(`   Recordings    → /api/recordings`);
  console.log(`   Teams         → /api/teams`);
  console.log(`   Notifications → /api/notifications`);
});
