require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

const PRIVATE_ROOM_ID = process.env.PRIVATE_ROOM_ID;

// Serve frontend files
app.use(express.static("public"));

// Check room information
app.get("/room-info", (req, res) => {
    res.json({
        roomExists: true,
        roomId: PRIVATE_ROOM_ID,
        maxUsers: 2
    });
});


// ===============================
// SOCKET.IO
// ===============================

io.on("connection", (socket) => {

    console.log("A user connected:", socket.id);


    socket.on("join-room", (roomId) => {

        console.log(`User ${socket.id} wants to join ${roomId}`);

        // Make sure the requested room is our private room
        if (roomId !== PRIVATE_ROOM_ID) {

            socket.emit("room-error", {
                message: "Invalid private room."
            });

            return;
        }


        // Get current users in the room
        const room = io.sockets.adapter.rooms.get(roomId);

        const currentUsers = room ? room.size : 0;


        // Allow only two users
        if (currentUsers >= 2) {

            socket.emit("room-full", {
                message: "This private room already has two participants."
            });

            return;
        }


        // Join the room
        socket.join(roomId);

        console.log(
            `User ${socket.id} joined ${roomId}`
        );


        // Tell the user they successfully joined
        socket.emit("room-joined", {
            roomId: roomId
        });


        // Tell everyone else in the room
        socket.to(roomId).emit("participant-joined", {
            message: "Another participant has joined the room."
        });

    });


    // ===============================
    // CHAT MESSAGE
    // ===============================

    socket.on("send-message", (message) => {

        const rooms = [...socket.rooms];

        const roomId = rooms.find(
            room => room !== socket.id
        );

        if (!roomId) {
            return;
        }


        io.to(roomId).emit("receive-message", {
            message: message,
            sender: socket.id,
            timestamp: new Date().toISOString()
        });

    });


    // ===============================
    // DISCONNECT
    // ===============================

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});
 

server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

    console.log(
        `Private room: ${PRIVATE_ROOM_ID}`
    );

});