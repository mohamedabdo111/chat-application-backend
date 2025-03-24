const express = require("express");
const { Server } = require("socket.io");
const app = express();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let OnlineUsers = [];

io.on("connection", (socket) => {
  socket.on("join", (userID) => {
    if (!socket.rooms.has(userID)) {
      socket.join(userID);
      if (!OnlineUsers.includes(userID)) {
        OnlineUsers.push(userID);
      }
    }
    console.log("User Connected", OnlineUsers);
    OnlineUsers.forEach((user) => {
      io.to(user).emit("online-users", OnlineUsers);
    });
  });

  socket.on("send-new-message", (message) => {
    message.chat.users.forEach((user) => {
      io.to(user._id).emit("new-message-received", message);
    });
  });

  socket.on("typing", ({ chat, senderId, senderName }) => {
    chat.users.forEach((user) => {
      if (user._id !== senderId) {
        io.to(user._id).emit("typing", { chat, senderName });
      }
    });
  });

  socket.on("read-all-messages", ({ chatId, readBy, users }) => {
    users.forEach((user) => {
      io.to(user).emit("user-read-all-chat-messages", { chatId, readBy });
    });
  });
  socket.on("logout", (userID) => {
    socket.leave(userID);
    OnlineUsers = OnlineUsers.filter((user) => user !== userID);
    OnlineUsers.forEach((user) => {
      io.to(user).emit("online-users", OnlineUsersFilter);
    });
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Chat Application node js server</h1>");
});
