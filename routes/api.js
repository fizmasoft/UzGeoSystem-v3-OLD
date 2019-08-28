var CONFIG = require("../config/config");
const fsCore = require("../core/fsCore");
const core = new fsCore();

var io = require("socket.io")();

io.of("/api").on("connection", function(socket) {
  core.init(socket);
});

io.listen(CONFIG.FS.PORT);
console.log("Server started on port: ", CONFIG.FS.PORT);
