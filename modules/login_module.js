"use strict";

var jwt = require("jsonwebtoken");

class fsLogin {
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
      `SELECT 
        fu.id, fu.name, fu.organization_id, fo.name AS org_name, fo.status AS org_status, fo.devices_id, fo.balance, fo.devices_limit, fo.tariff_id, fo.extra_charge  
      FROM 
        fizmasoft_users fu 
      JOIN 
        fizmasoft_organization fo ON fu.organization_id = fo.id 
      WHERE 
        username='${post.username}' AND password=MD5(MD5(MD5('${post.password}'))) AND fu.status 
      LIMIT 1;`,
      (err, res) => {
        if (err) {
          this.socket.emit("err", err);
        } else {
          if (res.rowCount > 0) {
            var token = jwt.sign(
              { data: res.rows },
              this.Parent.CONFIG.SECRET,
              {
                expiresIn: parseInt(this.Parent.CONFIG.SESSION_TIMEOUT)
              }
            );
            this.socket.emit("login", { token });
          } else {
            this.socket.emit("err", { error: -1, message: "User not found" });
          }
        }
        this.Parent.DB.disconnect();
      }
    );
  }
}

module.exports = fsLogin;
