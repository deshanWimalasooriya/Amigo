require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./api/models');

const app = express();
const server = http.createServer(app);

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(cookieParser());

// ─── SOCKET.IO (WebRTC Signaling Server) ──────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ─── REST ROUTES ──────────────────────────────────────────────────────────────
const authRoutes = require('./api/routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('✅ Amigo Backend Server is Running!');
});

// ─── ROOM REGISTRY ────────────────────────────────────────────────────────────
// rooms: { roomId: [ { socketId, userName } ] }
const rooms = {};

// ─── SOCKET.IO – REAL-TIME WEBRTC SIGNALING ───────────────────────────────────
io.on('connection', (socket) => {
    console.log(`⚡ New Connection: ${socket.id}`);

    // ── 1. JOIN ROOM ──────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userName }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = [];

        // Send list of existing users to the new joiner so they can initiate peers
        const existingSocketIds = rooms[roomId].map(u => u.socketId);
        socket.emit('all-users', existingSocketIds);

        // Register the new user
        rooms[roomId].push({ socketId: socket.id, userName });

        // Notify all other users in the room
        socket.to(roomId).emit('user-connected', { socketId: socket.id, userName });

        console.log(`📌 [${roomId}] ${userName} joined. Total: ${rooms[roomId].length}`);
    });

    // ── 2. SDP OFFER (Initiator → New User) ──────────────────────────────────
    // The joining user creates a Peer(initiator:true) and sends the offer signal
    socket.on('sending-signal', ({ userToSignal, signal, callerID, userName }) => {
        io.to(userToSignal).emit('user-joined', { signal, callerID, userName });
    });

    // ── 3. SDP ANSWER (Non-Initiator → Initiator) ────────────────────────────
    // The existing user accepts the offer and returns their answer signal
    socket.on('returning-signal', ({ signal, callerID }) => {
        io.to(callerID).emit('receiving-returned-signal', { signal, id: socket.id });
    });

    // ── 4. CHAT MESSAGE RELAY ─────────────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, userName, time }) => {
        socket.to(roomId).emit('receive-message', { message, userName, time });
    });

    // ── 5. DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);

        for (const roomId in rooms) {
            const idx = rooms[roomId].findIndex(u => u.socketId === socket.id);
            if (idx !== -1) {
                const [removed] = rooms[roomId].splice(idx, 1);
                socket.to(roomId).emit('user-disconnected', socket.id);
                console.log(`🚪 ${removed.userName} left room [${roomId}]`);
                if (rooms[roomId].length === 0) delete rooms[roomId];
                break;
            }
        }
    });
});

// ─── DATABASE SYNC ────────────────────────────────────────────────────────────
db.sequelize.sync()
    .then(() => console.log('✅ Database synced successfully.'))
    .catch((err) => console.log('❌ DB sync failed: ' + err.message));

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Amigo Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📡 Socket.IO WebRTC Signaling: ACTIVE`);
});
