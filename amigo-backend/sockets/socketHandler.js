module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`⚡: User Connected ${socket.id}`);

        // 1. Join Room
        socket.on("join-room", ({ roomId, userId, userName }) => {
            socket.join(roomId);
            console.log(`User ${userName} joined Room: ${roomId}`);

            // Broadcast to everyone ELSE: "Hey, User X joined!"
            // We pass the socketId so the host can call this specific person
            socket.to(roomId).emit("user-connected", { 
                userId, 
                userName, 
                socketId: socket.id 
            });
        });

        // 2. Relay Call (Offer)
        socket.on("call-user", ({ userToCall, signalData, from, name }) => {
            io.to(userToCall).emit("call-made", { 
                signal: signalData, 
                from, 
                name 
            });
        });

        // 3. Relay Answer (Answer)
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
        });
    });
};