"use strict";

/*
 * listener `users`
 * params {jwt token, name, username, surname, position, password, status, organization_id, photo, user_id }
 */

class fsUsers {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "users";
    this.cancelVerify = false;
  }

  validateRequest(post) {
    if (
      !post.organization_id ||
      !post.username ||
      !post.password ||
      !post.name ||
      !post.surname ||
      !post.position ||
      !post.photo ||
      post.status === ""
    ) {
      this.socket.emit("err", { status: 400, message: "Bad request" });
      return false;
    } else return true;
  }

  post(post) {
    if (this.validateRequest(post))
      this.Parent.DB.query(
        `INSERT INTO 
            fizmasoft_users (organization_id, username, password, name, surname, position, photo, status) 
        VALUES 
            (${post.organization_id}, '${post.username}', '${post.password}', '${post.name}', '${post.surname}', '${post.position}', '${post.photo}', ${post.status});`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 201,
            message: "User created"
          });
        }
      );
  }

  put(post) {
    if (!post.user_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    if (this.validateRequest(post)) {
      this.Parent.DB.query(
        `UPDATE fizmasoft_organization 
        SET (organization_id, username, password, name, surname, position, photo, status)
            = (${post.organization_id}, '${post.username}', '${post.password}', '${post.name}', '${post.surname}', '${post.position}', '${post.photo}', ${post.status}) 
        WHERE id = ${post.user_id};`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 204,
            message: "User updated"
          });
        }
      );
    }
  }

  get(post) {
    if (!post.organization_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });
    this.Parent.DB.query(
      `SELECT * FROM fizmasoft_users WHERE organization_id = ${post.organization_id}`,
      (err, res) => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal servewr error"
          });
        return this.socket.emit(this.Path, { status: 200, data: res.rows });
      }
    );
  }

  delete(post) {
    if (!post.user_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM fizmasoft_users WHERE id = ${post.user_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "User deleted"
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
        this.get(post);
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

module.exports = fsUsers;
