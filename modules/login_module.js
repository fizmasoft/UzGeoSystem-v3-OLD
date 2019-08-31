"use strict";

var jwt = require("jsonwebtoken");

class fsModule {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "login";
    this.cancelVerify = true;
  }

  run(post) {
    try {
      post = JSON.parse(post);

      if (
        !post.hasOwnProperty("username") ||
        !post.hasOwnProperty("password")
      ) {
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
                  expiresIn: 60 * 60
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
    } catch (error) {
      this.socket.emit("err", { error: -1, message: "Error in request" });
      return;
    }
  }
}

module.exports = fsModule;
