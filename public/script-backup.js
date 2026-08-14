const socket = io();

const roomId = "my-private-room-2026";

console.log("Connecting to private room...");

socket.on("connect", () => {
    console.log("Connected to server!");
    console.log("Socket ID:", socket.id);

    socket.emit("join-room", roomId);
});

socket.on("room-joined", (data) => {
    console.log("Successfully joined private room:", data.roomId);
});

socket.on("participant-joined", (data) => {
    console.log(data.message);
});

socket.on("room-full", (data) => {
    console.log("ROOM FULL:", data.message);
});

socket.on("room-error", (data) => {
    console.log("ROOM ERROR:", data.message);
});

socket.on("receive-message", (data) => {
    console.log("Message received:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});
const enterButton = document.querySelector(
    ".enter-button"
);

if (enterButton) {

    enterButton.addEventListener("click", () => {

        window.location.href = "/chat.html";

    });

}