require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Your permanent private room ID comes from Render
const PRIVATE_ROOM_ID = process.env.PRIVATE_ROOM_ID;

app.use(express.static("public"));

// Check the private room ID
app.get("/room-info", (req, res) => {
    res.json({
        success: true,
        roomConfigured: Boolean(PRIVATE_ROOM_ID)
    });
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // User tries to join the private room
    socket.on("join-room", (enteredRoomId) => {

        const roomId = String(enteredRoomId || "").trim();

        // Check whether the entered ID is correct
        if (!PRIVATE_ROOM_ID || roomId !== PRIVATE_ROOM_ID) {

            socket.emit("room-error", {
                message: "Invalid Private Room ID."
            });

            return;
        }

        // Check how many people are already inside
        const room = io.sockets.adapter.rooms.get(PRIVATE_ROOM_ID);
        const currentUsers = room ? room.size : 0;

        // Maximum 2 people
        if (currentUsers >= 2) {

            socket.emit("room-full", {
                message: "This private room is already full."
            });

            return;
        }

        // Join the permanent private room
        socket.join(PRIVATE_ROOM_ID);

        socket.data.roomId = PRIVATE_ROOM_ID;

        socket.emit("room-joined", {
            message: "You joined the private room."
        });

        // Tell the other person that someone joined
        socket.to(PRIVATE_ROOM_ID).emit("participant-joined");

        console.log(
            `${socket.id} joined the private room`
        );
    });


    // Send chat message
    socket.on("send-message", (message) => {

        if (typeof message !== "string") {
            return;
        }

        const cleanMessage = message.trim();

        if (!cleanMessage || cleanMessage.length > 1000) {
            return;
        }

        const roomId = socket.data.roomId;

        // Only allow messages from people
        // who successfully joined the private room
        if (!roomId || !socket.rooms.has(roomId)) {
            return;
        }

        io.to(roomId).emit("receive-message", {
            message: cleanMessage,
            sender: socket.id,
            timestamp: new Date().toISOString()
        });
    });


    // User leaves
    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


server.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});