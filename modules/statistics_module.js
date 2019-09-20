"use strict";

class fsStatistics {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "statistics";
    this.cancelVerify = false;
  }

  getSts(post) {
    post.names.forEach(func => {
      this.Parent.DB.query(
        `SELECT * FROM ${func}(${parseInt(post.device_id)})`,
        (err, res) => {
          if (err) this.socket.emit("err", err);
          else this.socket.emit("getSts", { function: func, res: res.rows });
        }
      );
    });
  }

  run(post) {
    this.Parent.DB.connect();
    switch (post.action) {
      case "getSts":
        this.getSts(post);
        break;
      default:
        if (post.device_id)
          this.Parent.DB.query(
            `SELECT * FROM gps.fizmasoft_statistics fs JOIN gps.fizmasoft_functions ff ON fs.function_id = ff.id WHERE device_id = ${post.device_id}`,
            (err, res) => {
              if (err) this.socket.emit("err", "`fizmasoft_statistics` " + err);
              else this.socket.emit("statistics", res.rows);
              this.Parent.DB.disconnect();
            }
          );
        else {
          this.Parent.DB.disconnect();
          this.socket.emit("err", "Error in request");
        }
        break;
    }
  }
}

module.exports = fsStatistics;
