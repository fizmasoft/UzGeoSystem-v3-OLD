var jwt = require("jsonwebtoken");
var config = require("../config/config");

var auth = class Auth {
  authorize(socket, props) {}

  verify(socket, props) {
    jwt.verify(props.token, config.secret, function(err, decoded) {
      if (err) {
        socket.emit("err", { status: 401, message: "Unauthorized" });
      } else {
        return true;
      }
    });
  }
};

module.exports = auth;
