var io = require("socket.io")(8787);

io.of("/api").on("connection", function(socket) {
  socket.on("login", function(post) {
    socket.emit("err", { status: 401, message: "Unauthorized" });
  });
});
