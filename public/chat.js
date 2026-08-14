const socket = io();

const roomSelection = document.getElementById("roomSelection");
const chatSection = document.getElementById("chatSection");

const roomIdInput = document.getElementById("roomIdInput");
const joinRoomButton = document.getElementById("joinRoomButton");
const roomMessage = document.getElementById("roomMessage");

const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");


// JOIN PRIVATE ROOM
joinRoomButton.addEventListener("click", () => {

    const roomId = roomIdInput.value.trim();

    if (!roomId) {
        roomMessage.textContent =
            "Please enter your Private Room ID.";
        return;
    }

    roomMessage.textContent =
        "Checking Private Room ID...";

    joinRoomButton.disabled = true;

    socket.emit("join-room", roomId);
});


// ENTER KEY SUPPORT
roomIdInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        event.preventDefault();
        joinRoomButton.click();
    }

});


// SUCCESSFULLY JOINED
socket.on("room-joined", (data) => {

    roomSelection.classList.add("hidden");

    chatSection.classList.remove("hidden");

    statusText.textContent =
        "Private room connected";

    statusDot.style.background =
        "#8b5cf6";

    messageInput.focus();

});


// INVALID ROOM ID
socket.on("room-error", (data) => {

    roomMessage.textContent =
        data.message;

    joinRoomButton.disabled = false;

    roomIdInput.focus();

    roomIdInput.select();

});


// ROOM FULL
socket.on("room-full", (data) => {

    roomMessage.textContent =
        data.message;

    joinRoomButton.disabled = false;

});


// OTHER PERSON JOINED
socket.on("participant-joined", () => {

    statusText.textContent =
        "Connected · 2 people";

});


// SEND MESSAGE
messageForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const message =
        messageInput.value.trim();

    if (!message) {
        return;
    }

    socket.emit(
        "send-message",
        message
    );

    messageInput.value = "";

    messageInput.focus();

});


// RECEIVE MESSAGE
socket.on("receive-message", (data) => {

    addMessage(
        data.message,
        data.sender === socket.id
    );

});


// DISPLAY MESSAGE
function addMessage(message, mine) {

    const welcomeMessage =
        document.querySelector(".welcome-message");

    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageElement =
        document.createElement("div");

    messageElement.classList.add("message");

    if (mine) {
        messageElement.classList.add("mine");
    } else {
        messageElement.classList.add("theirs");
    }

    messageElement.textContent =
        message;

    messages.appendChild(
        messageElement
    );

    messages.scrollTop =
        messages.scrollHeight;
}


// SOCKET CONNECTED
socket.on("connect", () => {

    statusText.textContent =
        "Connected";

});


// SOCKET DISCONNECTED
socket.on("disconnect", () => {

    statusText.textContent =
        "Disconnected";

    statusDot.style.background =
        "#ef4444";

});