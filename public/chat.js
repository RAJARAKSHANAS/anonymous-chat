const socket = io();

const ROOM_ID = "my-private-room-2026";

const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");


/* CONNECT */

socket.on("connect", () => {

    console.log("Connected to private chat.");

    statusText.textContent = "Connected";

    statusDot.style.background = "#8b5cf6";

    statusDot.style.boxShadow =
        "0 0 12px rgba(139, 92, 246, 0.7)";

    socket.emit("join-room", ROOM_ID);
});


/* SUCCESSFULLY JOINED */

socket.on("room-joined", () => {

    console.log("Joined private room.");

});


/* SOMEONE ELSE JOINED */

socket.on("participant-joined", () => {

    console.log("Another participant joined.");

});


/* ROOM FULL */

socket.on("room-full", (data) => {

    statusText.textContent = "Room full";

    statusDot.style.background = "#ef4444";

    statusDot.style.boxShadow =
        "0 0 12px rgba(239, 68, 68, 0.6)";

    alert(data.message);

});


/* INVALID ROOM */

socket.on("room-error", (data) => {

    console.error(data.message);

});


/* SEND MESSAGE */

messageForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    socket.emit("send-message", message);

    messageInput.value = "";

    messageInput.focus();

});


/* RECEIVE MESSAGE */

socket.on("receive-message", (data) => {

    addMessage(
        data.message,
        data.sender === socket.id
    );

});


/* ADD MESSAGE TO SCREEN */

function addMessage(message, mine) {

    const welcome = document.querySelector(".welcome-message");

    if (welcome) {
        welcome.remove();
    }

    const messageElement =
        document.createElement("div");

    messageElement.classList.add("message");

    if (mine) {
        messageElement.classList.add("mine");
    } else {
        messageElement.classList.add("theirs");
    }

    messageElement.textContent = message;

    messages.appendChild(messageElement);

    messages.scrollTop = messages.scrollHeight;

}


/* DISCONNECT */

socket.on("disconnect", () => {

    statusText.textContent = "Disconnected";

    statusDot.style.background = "#ef4444";

    statusDot.style.boxShadow =
        "0 0 12px rgba(239, 68, 68, 0.6)";

});