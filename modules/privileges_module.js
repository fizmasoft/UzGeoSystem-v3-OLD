"use strict";

/*
 * listener `privileges`
 * params {jwt token, user_id, feature_id}
 */

class fsPrivileges {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "privileges";
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
            fizmasoft_privileges (user_id, feature_id) 
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
            message: "Privileges created"
          });
        }
      );
  }

  put(post) {
    if (!post.privilege_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    if (this.validateRequest(post)) {
      this.Parent.DB.query(
        `UPDATE fizmasoft_privileges 
        SET (user_id, feature_id)
            = (${post.user_id}, '${post.feature_id}') WHERE id = ${post.privilege_id};`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 204,
            message: "Privilege updated"
          });
        }
      );
    }
  }

  get() {
    this.Parent.DB.query(`SELECT * FROM fizmasoft_privileges`, (err, res) => {
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
    if (!post.privilege_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM fizmasoft_privileges WHERE id = ${post.privilege_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Privilege deleted"
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

module.exports = fsPrivileges;
