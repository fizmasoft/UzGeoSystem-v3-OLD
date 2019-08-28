'use strict'

const { Pool } = require("pg");
const CONFIG = require("../config/config")

class pgCore {
    constructor() { }

    connect() {
        this.client = new Pool({
            host: CONFIG.DB.HOST,
            port: CONFIG.DB.PORT,
            user: CONFIG.DB.USER,
            database: CONFIG.DB.DATABASE,
            password: CONFIG.DB.PASSWORD,
            application_name: 'UzGeoSystem v3.0',
            max: 10, // max number of clients in the pool
            idleTimeoutMillis: 30000
        });
    }

    query(queryText, callback) {
        this.client.query(queryText, (err, res)=>{
            if (typeof callback === 'function') {
                callback(err, res);
            }
        });
    }

    disconnect(callback) {
        this.client.end((err)=>{
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    }
}

module.exports = pgCore;