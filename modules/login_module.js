"use strict";

var jwt = require("jsonwebtoken");

class fsModule {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "login";
    this.cancelVerify = true;
  }

  run(post) {
    if (!post.hasOwnProperty("username") || !post.hasOwnProperty("password")) {
      this.socket.emit("err", { error: -1, message: "Error in request" });
      return;
    }

    this.Parent.DB.connect();
    this.Parent.DB.query(
      `SELECT id, name FROM fizmasoft_users WHERE username='${post.username}' AND password=MD5(MD5(MD5('${post.password}'))) AND status LIMIT 1;`,
      (err, res) => {
        if (err) {
          this.socket.emit("err", err);
        } else {
          if (res.rowCount > 0) {
            var token = jwt.sign(
              { user: res.rows },
              this.Parent.CONFIG.SECRET,
              {
                expiresIn: parseInt(this.Parent.CONFIG.SESSION_TIMEOUT)
              }
            );
            this.socket.emit("login", token);
          } else {
            this.socket.emit("err", { error: -1, message: "User not found" });
          }
        }
        this.Parent.DB.disconnect();
      }
    );
  }
}

module.exports = fsModule;
