require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./api/models');

// Route imports
const authRoutes = require('./api/routes/authRoutes');

// Initialize App
const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------------------------
// REST API ROUTES
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);   // POST /api/auth/login, /register, /logout, GET /api/auth/me

// Health check
app.get('/', (req, res) => {
  res.send('\u2705 Amigo Backend is running!');
});

// ---------------------------------------------------------------------------
// SOCKET.IO — WebRTC Signaling
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Room tracking: { roomId: [{ socketId, userId, userName }] }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`\u26A1 New connection: ${socket.id}`);

  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, userId, userName });

    console.log(`\u2705 ${userName} joined room [${roomId}] — ${rooms[roomId].length} user(s)`);
    socket.to(roomId).emit('user-connected', userId, userName);

    socket.on('offer', (offer, targetSocketId) => {
      io.to(targetSocketId).emit('offer', offer, socket.id);
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

    socket.on('disconnect', () => {
      console.log(`\u274C ${userName} left room [${roomId}]`);
      socket.to(roomId).emit('user-disconnected', userId);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`\u274C Disconnected: ${socket.id}`);
  });
});

// ---------------------------------------------------------------------------
// DATABASE + SERVER START
// ---------------------------------------------------------------------------
db.sequelize.sync()
  .then(() => console.log('\u2705 Database synced.'))
  .catch(err => console.error('\u274C DB sync failed:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n\uD83D\uDE80 Amigo backend running on http://localhost:${PORT}`);
});
