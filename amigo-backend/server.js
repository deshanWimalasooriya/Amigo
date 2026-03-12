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
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",  // Vite default dev port
        "http://localhost:4173"   // Vite preview port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser());

// --- WEBRTC / SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:4173"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Basic Test Route
app.get('/', (req, res) => {
    res.send("\u2705 Amigo Backend Server is Running!");
});

// --- ROOM TRACKING ---
// Structure: { roomId: [ { socketId, userId, userName } ] }
const rooms = {};

// --- SOCKET / WEBRTC SIGNALING ---
io.on("connection", (socket) => {
    console.log(`\u26A1 New Connection: ${socket.id}`);

    // -------------------------------------------------------
    // EVENT: User joins a room
    // Emitted by frontend when entering the Room page
    // -------------------------------------------------------
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);

        // Track user in the room
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ socketId: socket.id, userId, userName });

        console.log(`\u2705 ${userName} (${userId}) joined room: ${roomId}`);
        console.log(`   Room [${roomId}] now has ${rooms[roomId].length} user(s)`);

        // Tell all OTHER existing users in this room that a new user arrived
        // They will then initiate a WebRTC offer to the new user
        socket.to(roomId).emit("user-connected", userId, userName);

        // -------------------------------------------------------
        // EVENT: WebRTC Offer (caller → callee)
        // The initiating peer sends their SDP offer
        // -------------------------------------------------------
        socket.on("offer", (offer, targetSocketId) => {
            console.log(`   Relaying OFFER from ${socket.id} → ${targetSocketId}`);
            io.to(targetSocketId).emit("offer", offer, socket.id);
        });

        // -------------------------------------------------------
        // EVENT: WebRTC Answer (callee → caller)
        // The receiving peer sends back their SDP answer
        // -------------------------------------------------------
        socket.on("answer", (answer, targetSocketId) => {
            console.log(`   Relaying ANSWER from ${socket.id} → ${targetSocketId}`);
            io.to(targetSocketId).emit("answer", answer, socket.id);
        });

        // -------------------------------------------------------
        // EVENT: ICE Candidate relay
        // Both peers exchange network candidates for NAT traversal
        // -------------------------------------------------------
        socket.on("ice-candidate", (candidate, targetSocketId) => {
            io.to(targetSocketId).emit("ice-candidate", candidate, socket.id);
        });

        // -------------------------------------------------------
        // EVENT: Chat Message
        // Broadcast to ALL users in the room (including sender)
        // -------------------------------------------------------
        socket.on("chat-message", (message, senderName) => {
            console.log(`   Chat in [${roomId}] from ${senderName}: ${message}`);
            io.in(roomId).emit("chat-message", message, senderName, socket.id);
        });

        // -------------------------------------------------------
        // EVENT: Audio/Video Toggle
        // Notify other peers that this user toggled their stream
        // -------------------------------------------------------
        socket.on("toggle-audio", (isMuted) => {
            socket.to(roomId).emit("peer-audio-toggle", socket.id, isMuted);
        });

        socket.on("toggle-video", (isOff) => {
            socket.to(roomId).emit("peer-video-toggle", socket.id, isOff);
        });

        // -------------------------------------------------------
        // EVENT: Disconnect
        // Clean up room state and notify other users
        // -------------------------------------------------------
        socket.on("disconnect", () => {
            console.log(`\u274C ${userName} disconnected from room: ${roomId}`);

            // Notify all remaining users in the room
            socket.to(roomId).emit("user-disconnected", userId);

            // Remove user from room tracking
            if (rooms[roomId]) {
                rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
                // Clean up empty rooms
                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                    console.log(`   Room [${roomId}] is now empty and removed.`);
                }
            }
        });
    });

    // Handle disconnection before join-room is called
    socket.on("disconnect", () => {
        console.log(`\u274C Connection closed: ${socket.id}`);
    });
});

// --- DATABASE CONNECTION ---
db.sequelize.sync()
  .then(() => {
    console.log("\u2705 Synced database successfully.");
  })
  .catch((err) => {
    console.log("\u274C Failed to sync database: " + err.message);
  });

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n\uD83D\uDE80 Server running on port ${PORT}`);
    console.log(`\uD83D\uDD17 Test it here: http://localhost:${PORT}`);
});
