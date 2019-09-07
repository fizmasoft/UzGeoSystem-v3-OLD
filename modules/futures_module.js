"use strict";

/*
 *  if action is not given default listener `futures` list of features
 *  params {jwt token}
 */

/*
 *  for updateing features emit and listen `updateFeatures`
 *  params {jwt token, id, name, description, action = 'updateFeatures'}
 */

/*
 *  for inserting features emit and listen `insertFeatures`
 *  params {jwt token, id, name, description, action = 'insertFeatures'}
 */

class fsFeatures {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "futures";
    this.cancelVerify = false;
  }

  updateFeatures(post) {
    this.Parent.DB.query(
      `UPDATE fizmasoft_features SET name = '${post.name}', description = '${post.description}' WHERE id = ${post.id};`,
      err => {
        if (err) this.socket.emit("err", "Could not update 'features' " + err);
        else this.socket.emit("updateFeatures", { ok: true, id: post.id });
        this.Parent.DB.disconnect();
      }
    );
  }

  insertFeatures(post) {
    this.Parent.DB.query(
      `INSERT INTO fizmasoft_features (id, name, description) VALUES (${post.id},'${post.name}', '${post.description}');`,
      err => {
        if (err) this.socket.emit("err", "Could not insert 'features' " + err);
        else this.socket.emit("insertFeatures", { ok: true });
        this.Parent.DB.disconnect();
      }
    );
  }

  run(post, decodedJWT) {
    this.Parent.DB.connect();
    switch (post.action) {
      case "updateFeatures":
        this.updateFeatures(post);
        break;
      case "insertFeatures":
        this.insertFeatures(post);
        break;
      default:
        this.Parent.DB.query(`SELECT * FROM fizmasoft_features`, (err, res) => {
          if (err)
            this.socket.emit("err", "Could not select 'features' " + err);
          else this.socket.emit(this.Path, res.rows);
          this.Parent.DB.disconnect();
        });
        break;
    }
  }
}

module.exports = fsFeatures;
