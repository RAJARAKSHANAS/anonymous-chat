require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const PRIVATE_ROOM_ID = process.env.PRIVATE_ROOM_ID;

// Serve frontend
app.use(express.static("public"));


// =====================================
// ROOM INFORMATION
// =====================================

app.get("/room-info", (req, res) => {

    const room =
        io.sockets.adapter.rooms.get(PRIVATE_ROOM_ID);

    const currentUsers = room ? room.size : 0;

    res.json({
        roomExists: true,
        maxUsers: 2,
        currentUsers: currentUsers
    });

});


// =====================================
// SOCKET.IO
// =====================================

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    // =================================
    // JOIN PRIVATE ROOM
    // =================================

    socket.on("join-room", (roomId) => {

        console.log(
            `User ${socket.id} requested room: ${roomId}`
        );


        // Check room ID
        if (roomId !== PRIVATE_ROOM_ID) {

            socket.emit("room-error", {
                message: "Invalid private room."
            });

            return;
        }


        // Prevent joining twice
        if (socket.rooms.has(PRIVATE_ROOM_ID)) {

            socket.emit("room-error", {
                message: "You are already inside this room."
            });

            return;
        }


        // Get current room
        const room =
            io.sockets.adapter.rooms.get(PRIVATE_ROOM_ID);

        const currentUsers =
            room ? room.size : 0;


        // Maximum 2 participants
        if (currentUsers >= 2) {

            console.log(
                `Room full. Rejected user: ${socket.id}`
            );

            socket.emit("room-full", {
                message:
                    "This private room already has two participants."
            });

            return;
        }


        // Join room
        socket.join(PRIVATE_ROOM_ID);


        console.log(
            `User ${socket.id} joined private room.`
        );


        // Tell joining user
        socket.emit("room-joined", {

            roomId: PRIVATE_ROOM_ID,

            participantCount: currentUsers + 1

        });


        // Tell existing participant
        socket.to(PRIVATE_ROOM_ID).emit(
            "participant-joined",
            {
                message:
                    "The other participant has joined the room."
            }
        );

    });


    // =================================
    // SEND MESSAGE
    // =================================

    socket.on("send-message", (message) => {

        // Make sure message is actually text
        if (typeof message !== "string") {
            return;
        }


        // Remove unnecessary spaces
        const cleanMessage =
            message.trim();


        // Ignore empty messages
        if (!cleanMessage) {
            return;
        }


        // Limit message size
        if (cleanMessage.length > 1000) {
            return;
        }


        // Make sure user is inside private room
        if (!socket.rooms.has(PRIVATE_ROOM_ID)) {
            return;
        }


        io.to(PRIVATE_ROOM_ID).emit(
            "receive-message",
            {
                message: cleanMessage,

                sender: socket.id,

                timestamp:
                    new Date().toISOString()
            }
        );

    });


    // =================================
    // DISCONNECT
    // =================================

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


// =====================================
// START SERVER
// =====================================

server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

    console.log(
        `Private room: ${PRIVATE_ROOM_ID}`
    );

});