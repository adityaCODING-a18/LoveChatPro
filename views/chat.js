const socket = io(); // Connect to Socket.io server

// ✅ Get the username from the server-rendered chat page
const userName = document.body.getAttribute("data-username"); // Ensure `data-username` is set in chat.ejs

// ✅ Send username to server
socket.emit("setUsername", userName);

// ✅ Listen for user join event
socket.on("userJoined", (username) => {
    addSystemMessage(`${username} joined the chat.`);
});

// ✅ Listen for chat messages and display them
socket.on("chatMessage", (data) => {
    addMessage(data.user, data.message, "received");
});

// ✅ Listen for user left event
socket.on("userLeft", (username) => {
    addSystemMessage(`${username} left the chat.`);
});

// ✅ Typing event listeners
const inputField = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
let typingTimer;

// Emit typing event when user starts typing
inputField.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit("stopTyping");
    }, 1000);
});

// Listen for typing event from other users
socket.on("typing", (username) => {
    typingIndicator.innerText = `${username} is typing...`;
});

// Listen for stopTyping event
socket.on("stopTyping", () => {
    typingIndicator.innerText = "";
});

// ✅ Send message function
function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();

    if (text !== "") {
        socket.emit("chatMessage", text);
        addMessage("You", text, "sent");
    }

    input.value = ""; // Clear input field
}

// ✅ Handle "Enter" key press to send message
document.getElementById("messageInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ✅ Function to add messages to chat UI
function addMessage(username, text, type) {
    let chatBox = document.getElementById("chatBox");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-container", type);

    let messageBubble = document.createElement("div");
    messageBubble.classList.add("message");

    let nameTag = document.createElement("span");
    nameTag.classList.add("username");
    nameTag.innerText = `${username}: `;

    messageBubble.appendChild(nameTag);
    messageBubble.appendChild(document.createTextNode(text));

    messageDiv.appendChild(messageBubble);
    chatBox.appendChild(messageDiv);

    // Auto-scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Function to add system messages (e.g., user joined/left)
function addSystemMessage(text) {
    let chatBox = document.getElementById("chatBox");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("system-message");
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);

    // Auto-scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Log when chat app loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("Chat app loaded!");
});
