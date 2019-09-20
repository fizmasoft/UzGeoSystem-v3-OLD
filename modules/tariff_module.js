"use strict";

/*
 * listener `tariff`
 * params {jwt token, name, price, allowed_features, devices_limit, tariff_id}
 */

class fsTariff {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "tariff";
    this.cancelVerify = true;
  }

  validateRequest(post) {
    if (
      !post.name ||
      !post.price ||
      !post.allowed_features ||
      !post.devices_limit
    ) {
      this.socket.emit("err", { status: 400, message: "Bad request" });
      return false;
    } else return true;
  }

  post(post) {
    if (this.validateRequest(post))
      this.Parent.DB.query(
        `INSERT INTO 
            fizmasoft_tariff (name, price, allowed_features, devices_limit) 
        VALUES 
            ('${post.name}', ${post.price}, '${post.allowed_features}', ${post.devices_limit});`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 201,
            message: "Tariff created"
          });
        }
      );
  }

  put(post) {
    if (!post.tariff_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    if (this.validateRequest(post)) {
      this.Parent.DB.query(
        `UPDATE fizmasoft_tariff 
        SET (name, price, allowed_features, devices_limit)
            = ('${post.name}', ${post.price}, '${post.allowed_features}', ${post.devices_limit}) WHERE id = ${post.tariff_id};`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 204,
            message: "Tariff updated"
          });
        }
      );
    }
  }

  get() {
    this.Parent.DB.query(`SELECT * FROM fizmasoft_tariff`, (err, res) => {
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
    if (!post.tariff_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM fizmasoft_tariff WHERE id = ${post.tariff_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Tariff deleted"
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

module.exports = fsTariff;
