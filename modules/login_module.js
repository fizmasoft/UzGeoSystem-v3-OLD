'use strict'

class fsModule {
    constructor(parent) {
        this.Parent = parent;
        this.Path = "login";
        this.cancelVerify = true;
    }

    run(post) {
        this.Parent.DB.connect();

        this.Parent.DB.query("SELECT * FROM regions", (err, res) => {
            if (err) return this.socket.emit('error', err);
            
            this.socket.emit('login', res.rows);
            this.Parent.DB.disconnect();
        });

    }
}

module.exports = fsModule;