let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require("socket.io");
    io = new Server(httpServer, { cors: { origin: "*" } });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("❌ Socket.IO chưa được khởi tạo!");
    }
    return io;
  },
};