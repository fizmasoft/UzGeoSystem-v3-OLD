require("dotenv").config();

module.exports = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  pwd: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME
};
