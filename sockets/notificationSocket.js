const onlineUsers = new Map();

export default function registerNotificationSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Socket conectat:", socket.id);

    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("🔴 Socket deconectat:", socket.id);
    });
  });

  io.sendNotificationTo = (userId, notification) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("new-notification", notification);
    }
  };
}