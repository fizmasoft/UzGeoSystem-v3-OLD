"use strict";

var jwt = require("jsonwebtoken");

class fsNotification {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "notification";
    this.cancelVerify = false;
    this.maxId = 0;
  }

  run(post) {
    this.Parent.DB.connect();

    var interval = setInterval(() => {
      jwt.verify(post.token, this.Parent.CONFIG.SECRET, (err, decoded) => {
        if (err) {
          this.socket.emit("err", { status: 401, message: "Unauthorized" });
          clearInterval(interval);
          this.Parent.DB.disconnect();
        } else {
          this.Parent.DB.query(
            `SELECT id, created_time, args FROM fizmasoft_notification WHERE user_id='${decoded.user[0].id}' AND NOT acknowledged ORDER BY id DESC;`,
            (err, res) => {
              if (err) {
                this.socket.emit("err", err);
              } else {
                if (res.rowCount > 0 && this.maxId < res.rows[0].id) {
                  this.maxId = res.rows[0].id;
                  this.socket.emit(this.Path, res.rows);
                }
              }
            }
          );
        }
      });
    }, parseInt(this.Parent.CONFIG.NOTIFICATION_INTERVAL));
  }
}

module.exports = fsNotification;
