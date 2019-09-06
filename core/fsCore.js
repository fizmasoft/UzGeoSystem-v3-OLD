"use strict";

var jwt = require("jsonwebtoken");
var CONFIG = require("../config/config");
var pgCore = require("./pgCore");

class fsCore {
  constructor() {
    this.tmp = {
      CONFIG,
      DB: new pgCore()
    };
    let that = this;
    let normalizedPath = require("path").join(__dirname, "../modules/"),
      tmp,
      _mods = [];

    require("fs")
      .readdirSync(normalizedPath)
      .forEach(function(file) {
        if (file.endsWith("_module.js")) {
          tmp = require("../modules/" + file);
          _mods.push(new tmp(that.tmp));
        }
      });
    this._modules = _mods;
  }

  init(_socket) {
    this._modules.forEach(module => {
      module.socket = _socket;
      _socket.on(module.Path, post => {
        try {
          post = JSON.parse(post);

          if (module.cancelVerify === true) return module.run(post);
          jwt.verify(post.token, CONFIG.SECRET, function(err, decoded) {
            if (err) {
              _socket.emit("err", { status: 401, message: "Unauthorized" });
            } else {
              module.run(post, decoded);
            }
          });
        } catch (error) {
          _socket.emit("err", { error: -1, message: "Error in request" });
          return;
        }
      });
    });
  }
}

module.exports = fsCore;
