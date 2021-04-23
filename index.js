const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./tools/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./tools/users");

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage(
        "مدیریت",
        `${user.username} عزیز به گفتگوی آنلاین خوش آمدید`
      )
    );

    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage("مدیریت", `${user.username} وارد شد`));
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("مدیریت", `${user.username} خارج شد`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
