require('dotenv').config();
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
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser());

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Match Frontend Port
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Basic Test Route
app.get('/', (req, res) => {
    res.send("✅ Amigo Backend Server is Running!");
});

// --- CRITICAL WEBRTC SOCKET LOGIC ---
// I have moved the logic here to ensure it works without conflicts
io.on("connection", (socket) => {
    console.log(`⚡ New Connection: ${socket.id}`);

    // 1. Join Room
    socket.on("join-room", ({ roomId, userId, userName }) => {
        socket.join(roomId);
        // Broadcast to everyone ELSE in the room that a user joined
        socket.to(roomId).emit("user-connected", { 
            userName, 
            socketId: socket.id 
        });
    });

    // 2. Call User (One-to-One Signal)
    // Important: We send this ONLY to the specific userToCall, not everyone
    socket.on("call-user", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("call-made", { 
            signal: signalData, 
            from, 
            name 
        });
    });

    // 3. Answer Call (One-to-One Signal)
    socket.on("answer-call", ({ signal, to }) => {
        io.to(to).emit("call-answered", { signal, answeredBy: socket.id });
    });

    // 4. Chat Messages
    socket.on("send-message", ({ roomId, message, userName, time }) => {
        socket.to(roomId).emit("receive-message", { message, userName, time });
    });

    // 5. Disconnect
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", socket.id);
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// --- ROUTES ---
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');
const meetingRoutes = require('./api/routes/meetingRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);

// NOTE: I removed the 'socketHandler(io)' lines because 
// we are now handling sockets directly above to prevent duplicate signals.

// --- DATABASE CONNECTION ---
db.sequelize.sync()
  .then(() => {
    console.log("✅ Synced database successfully.");
  })
  .catch((err) => {
    console.log("❌ Failed to sync database: " + err.message);
  });

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔗 Test it here: http://localhost:${PORT}`);
});