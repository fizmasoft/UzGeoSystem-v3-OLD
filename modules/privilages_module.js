"use strict";

/*
 * listener `privilages`
 * params {jwt token, user_id, feature_id}
 */

class fsPrivilages {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "privilages";
    this.cancelVerify = true;
  }

  validateRequest(post) {
    if (!post.user_id || !post.feature_id) {
      this.socket.emit("err", { status: 400, message: "Bad request" });
      return false;
    } else return true;
  }

  post(post) {
    if (this.validateRequest(post))
      this.Parent.DB.query(
        `INSERT INTO 
            fizmasoft_privilages (user_id, feature_id) 
        VALUES 
            (${post.user_id}, '${post.feature_id}');`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 201,
            message: "Privilage created"
          });
        }
      );
  }

  put(post) {
    if (!post.privilage_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    if (this.validateRequest(post)) {
      this.Parent.DB.query(
        `UPDATE fizmasoft_privilages 
        SET (user_id, feature_id)
            = (${post.user_id}, '${post.feature_id}') WHERE id = ${post.privilage_id};`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 204,
            message: "Privilage updated"
          });
        }
      );
    }
  }

  get() {
    this.Parent.DB.query(`SELECT * FROM fizmasoft_privilages`, (err, res) => {
      this.Parent.DB.disconnect();
      if (err)
        return this.socket.emit("err", {
          status: 500,
          message: "Internal servewr error"
        });
      return this.socket.emit(this.Path, { status: 200, data: res.rows });
    });
  }

  delete(post) {
    if (!post.privilage_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM fizmasoft_privilages WHERE id = ${post.privilage_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Privilage deleted"
        });
      }
    );
  }

  run(post) {
    this.Parent.DB.connect();
    switch (post.action) {
      case "post":
        this.post(post);
        break;
      case "put":
        this.put(post);
        break;
      case "get":
        this.get();
        break;
      case "delete":
        this.delete(post);
        break;
      default:
        this.Parent.DB.disconnect();
        this.socket.emit("err", { status: 404, message: "Action not found" });
        break;
    }
  }
}

module.exports = fsPrivilages;
