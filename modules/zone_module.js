"use strict";

/*
 *  params {jwt token, id, name, device_id, notification_type, ack, way, action}
 */

class fsZone {
  constructor(parent) {
    this.Parent = parent;
    this.Path = "zone";
    this.table = "gps.fizmasoft_zone";
    this.cancelVerify = false;
  }

  geoJsonToString(way) {
    let collectionString = "";

    try {
      way.forEach(element => {
        if (element.type === "Polygon") {
          collectionString +=
            collectionString === "" ? `POLYGON((` : `, POLYGON((`;
          element.latlngs.forEach((latlng, inx, lngArr) => {
            collectionString += `${latlng.lng} ${latlng.lat}`;
            if (inx != lngArr.length - 1) collectionString += `, `;
            else
              collectionString += `, ${element.latlngs[0].lng} ${element.latlngs[0].lat}`;
          });
          collectionString += `))`;
        } else if (element.type === "Line") {
          collectionString +=
            collectionString === "" ? `LINESTRING(` : `, LINESTRING(`;
          element.latlngs.forEach((latlng, inx, lngArr) => {
            collectionString += `${latlng.lng} ${latlng.lat}`;
            if (inx != lngArr.length - 1) collectionString += `, `;
          });
          collectionString += `)`;
        } else if (element.type === "Marker") {
          if (element.latlngs.length > 0) {
            collectionString += collectionString === "" ? `POINT(` : `, POINT(`;
            collectionString += `${element.latlngs[0].lng} ${element.latlngs[0].lat})`;
          }
        }
      });
    } catch (TypeError) {
      return "";
    }

    return collectionString === ""
      ? ""
      : `GEOMETRYCOLLECTION(${collectionString})`;
  }

  post(post) {
    if (!post.way || !post.name || !post.notification_type || !post.ack)
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    post.device_id = post.device_id ? post.device_id : "device_id";

    let parsedGeometry = this.geoJsonToString(post.way);
    if (parsedGeometry === "")
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `INSERT INTO 
            ${this.table} (name, device_id, notification_type, ack, way) 
        VALUES 
            ('${post.name}', ${post.device_id}, ${post.notification_type}, ${post.ack}, ST_Transform(ST_GeomFromText('${parsedGeometry}', 4326), 3857));`,
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
    if (
      !post.zone_id ||
      !post.way ||
      !post.name ||
      !post.notification_type ||
      !post.ack
    )
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    post.device_id = post.device_id ? post.device_id : "device_id";

    let parsedGeometry = this.geoJsonToString(post.way);
    if (parsedGeometry === "")
      return this.socket.emit("err", { status: 400, message: "Bad request" });

    this.Parent.DB.query(
      `UPDATE ${this.table} 
        SET (name, device_id, notification_type, ack, way)
            = ('${post.name}', ${post.device_id}, ${post.notification_type}, ${post.ack}, 'ST_Transform(ST_GeomFromText(${post.parsedGeometry}, 4326), 3857)') 
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
      `SELECT row_to_json(fc)
        FROM (
            SELECT
                'FeatureCollection' as "type",
                array_to_json(array_agg(f)) as "features"
            FROM (
                SELECT
                    'Feature' as "type",
                    ST_AsGeoJSON(ST_Transform(way, 4326)) :: json as "geometry",
                    (
                        SELECT json_strip_nulls(row_to_json(t))
                        FROM (
                            SELECT
                                "id",
                                "name",
                                "device_id",
                                notification_type,
                                ack
                        ) t
                    ) as "properties"
                FROM ${this.table}
            WHERE id = ${post.zone_id}
            ) as f
        ) as fc;`,
      (err, res) => {
        this.Parent.DB.disconnect();
        if (err)
          return this.socket.emit("err", {
            status: 500,
            message: "Internal servewr error"
          });
        return this.socket.emit("err", { status: 200, data: res.rows });
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
