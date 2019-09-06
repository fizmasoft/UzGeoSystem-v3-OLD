require("dotenv").config();

module.exports = {
  FS: {
    PORT: process.env.FS_PORT
  },

  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    POST: process.env.DB_PORT,
    DATABASE: process.env.DB_NAME
  },

  SECRET: process.env.SECRET,
  NOTIFICATION_INTERVAL: process.env.NOTIFICATION_INTERVAL,
  SESSION_TIMEOUT: process.env.SESSION_TIMEOUT
};
