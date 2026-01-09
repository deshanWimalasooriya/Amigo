require('dotenv').config();
const express = require('express');
const http = require('http'); // Native Node module
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require("./api/models");

// Initialize App
const app = express();
const server = http.createServer(app); // Wrap Express in HTTP server for WebRTC

// --- MIDDLEWARE ---
// 1. CORS: Allow your React Frontend to talk to this Backend
app.use(cors({
    origin: "http://localhost:3000", // Your Frontend URL
    credentials: true, // Allow Cookies to be sent/received
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// 2. Parsers: Understand JSON and Cookies
app.use(express.json());
app.use(cookieParser());

// --- WEBRTC / SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Basic Test Route (To check if server is alive)
app.get('/', (req, res) => {
    res.send("✅ Amigo Backend Server is Running!");
});

// --- SOCKET CONNECTION LOOP ---
io.on("connection", (socket) => {
    console.log(`⚡ New Real-Time Connection: ${socket.id}`);

    // We will add WebRTC logic here later
    socket.on("disconnect", () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// --- ROUTES ---
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// --- DATABASE CONNECTION ---
// sync() will create tables if they don't exist
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