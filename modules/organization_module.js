"use strict";

/*
 * listener `organization`
 * params {jwt token, name, balance, status, devices_limit, tariff_id, organization_id, devices_id, extra_charge}
 */

class fsOrganization {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "organization";
    this.cancelVerify = false;
  }

  validateRequest(post) {
    if (
      !post.tariff_id ||
      !post.name ||
      post.balance === "" ||
      post.balance === undefined ||
      post.status === "" ||
      post.status === undefined ||
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
            fizmasoft_organization (tariff_id, name, balance, status, devices_limit) 
        VALUES 
            ('${post.tariff_id}', '${post.name}', ${post.balance}, ${post.status}, ${post.devices_limit});`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 201,
            message: "Organization created"
          });
        }
      );
  }

  put(post) {
    if (!post.organization_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    if (this.validateRequest(post)) {
      var extra_charge = post.extra_charge ? post.extra_charge : 0;
      //var devices_id = /* post.devices_id ? post.devices_id :  */ "{}";

      this.Parent.DB.query(
        `UPDATE fizmasoft_organization 
        SET (tariff_id, name, balance, status, devices_limit, extra_charge)
            = ('${post.tariff_id}', '${post.name}', ${post.balance}, ${post.status}, ${post.devices_limit}, ${extra_charge}) WHERE id = ${post.organization_id};`,
        err => {
          this.Parent.DB.disconnect();
          if (err)
            return this.socket.emit("err", {
              status: 500,
              message: "Internal server error"
            });
          return this.socket.emit(this.Path, {
            status: 204,
            message: "Organization updated"
          });
        }
      );
    }
  }

  get() {
    this.Parent.DB.query(
      `SELECT fo.*, ft.name AS tariff_name FROM fizmasoft_organization fo JOIN fizmasoft_tariff ft ON fo.tariff_id = ft.id`,
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

  // cascade or delete from fizmasoft_users is needed - done

  delete(post) {
    if (!post.organization_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM fizmasoft_organization WHERE id = ${post.organization_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Organization deleted"
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

module.exports = fsOrganization;
