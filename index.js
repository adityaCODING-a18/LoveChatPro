const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(express.static("public"));
app.use(express.static("materials"));
app.use(express.urlencoded({ extended: true }));

// Store users
let users = {};

// Home route
app.get("/", (req, res) => {
    res.render("index");
});

// Handle form submission
app.post("/chat", (req, res) => {
    const userInput = req.body.userPass;
    const userName = req.body.username;

    // Validate password from .env
    if (userInput === process.env.PASSWORD) {
        res.render("chat", { userName: userName });
    } else {
        res.send("Not a valid password, who are you?");
    }
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for username and store it
    socket.on("setUsername", (username) => {
        users[socket.id] = username;
        socket.broadcast.emit("userJoined", username); // Notify others
    });

    // Listen for chat messages
    socket.on("chatMessage", (msg) => {
        const sender = users[socket.id] || "Anonymous";
        console.log(`Message from ${sender}: ${msg}`);
        socket.broadcast.emit("chatMessage", { user: sender, message: msg }); // Broadcast to everyone
    });

    // Listen for typing event
    socket.on("typing", () => {
        const sender = users[socket.id] || "User";
        socket.broadcast.emit("typing", `${sender} is typing...`); // Notify others
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping"); // Remove typing notification
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit("userLeft", username);
            delete users[socket.id]; // Remove user from list
        }
        console.log("User disconnected:", socket.id);
    });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

