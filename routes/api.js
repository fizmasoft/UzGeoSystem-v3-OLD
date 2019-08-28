var config = require("../config/config");
const Auth = require("./../models/auth");
const auth = new Auth();

var io = require("socket.io")();

io.of("/api").on("connection", function(socket) {
  socket.on("login", function(post) {
    auth.authorize(socket, post);
  });

  socket.on("search", function(post) {
    if (auth.verify(socket, post)) {
      console.log("DO job");
    }
  });
});

io.listen(config.port);
console.log("Server started on port: ", config.port);
