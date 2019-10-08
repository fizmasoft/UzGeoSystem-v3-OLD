"use strict";

/*
 *  params {jwt token, id, name, device_id, notification_type, ack, way, action}
 */

// lng lat
/* GEOMETRYCOLLECTION(
    POINT(0 0)
    POLYLINE(0 0, 0 1, 1 0, 1 1),
    POLYGON((0 0, 0 1, 1 0, 1 1, 0 0)),
    POLYGON((0 0, 0 1, 1 0, 1 1, 0 0))
    ) */

class fsZone {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "zone";
    this.table = "fizmasoft_zone";
    this.cancelVerify = true;
  }

  parser(way) {
    way = [
      {
        type: "Line",
        latlngs: [
          { lat: 41.1, lng: 69.2 },
          { lat: 41.2, lng: 69.3 },
          { lat: 41.3, lng: 69.4 }
        ]
      },
      {
        type: "Polygon",
        latlngs: [
          { lat: 42.5, lng: 62.7 },
          { lat: 42.6, lng: 62.6 },
          { lat: 42.7, lng: 62.5 }
        ]
      },
      {
        type: "Polygon",
        latlngs: [
          { lat: 42.1, lng: 62.2 },
          { lat: 42.2, lng: 62.3 },
          { lat: 42.3, lng: 62.4 }
        ]
      },
      {
        type: "Line",
        latlngs: [
          { lat: 42.1, lng: 62.2 },
          { lat: 42.2, lng: 62.3 },
          { lat: 42.3, lng: 62.4 }
        ]
      }
    ];

    let polygons = "";
    let lines = "";

    let polyObj = way.filter(p => p.type === "Polygon");
    let lineObj = way.filter(p => p.type === "Line");

    polyObj.forEach((polygon, index, array) => {
      polygons += `POLYGON((`;
      polygon.latlngs.forEach(latlng => {
        polygons += `${latlng.lng} ${latlng.lat}, `;
      });
      if (index != array.length - 1)
        polygons += `${polygon.latlngs[0].lng} ${polygon.latlngs[0].lat})), `;
      else polygons += `${polygon.latlngs[0].lng} ${polygon.latlngs[0].lat}))`;
    });

    lineObj.forEach((line, index, array) => {
      lines += `POLYLINE(`;
      line.latlngs.forEach((latlng, inx, subArr) => {
        lines += `${latlng.lng} ${latlng.lat}`;
        if (inx != subArr.length - 1) lines += `, `;
      });
      if (index != array.length - 1) lines += `), `;
      else lines += `)`;
    });

    var collection = "";
    if (polygons != "" && lines != "") {
      collection = `GEOMETRYCOLLECTION(${polygons}, ${lines})`;
    } else if (polygons != "") {
      collection = `GEOMETRYCOLLECTION(${polygons})`;
    } else if (lines != "") {
      collection = `GEOMETRYCOLLECTION(${lines})`;
    }

    return collection;
  }

  post(post) {
    this.Parent.DB.query(
      `INSERT INTO 
            ${this.table} (name, device_id, notification_type, ack, way) 
        VALUES 
            ('${post.name}', ${post.device_id}, ${post.notification_type}, ${post.ack}, '${post.way}');`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 201,
          message: "Zone created"
        });
      }
    );
  }

  put(post) {
    if (!post.zone_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `UPDATE ${this.table} 
        SET (name, device_id, notification_type, ack, way)
            = ('${post.name}', ${post.device_id}, ${post.notification_type}, ${post.ack}, '${post.way}') 
        WHERE id = ${post.zone_id};`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Zone updated"
        });
      }
    );
  }

  get(post) {
    if (!post.zone_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });
    this.Parent.DB.query(
      `SELECT 
          id, name, device_id, notification_type, ack, way
      FROM ${this.table} WHERE zone_id = ${post.zone_id}`,
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
    if (!post.zone_id)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `DELETE FROM ${this.table} WHERE id = ${post.zone_id}`,
      err => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal server error"
          });
        return this.socket.emit(this.Path, {
          status: 204,
          message: "Zone deleted"
        });
      }
    );
  }

  run(post) {
    this.parser(post);
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

module.exports = fsZone;
