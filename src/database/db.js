const mysql = require("mysql");
const session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

var options = {
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  connectionLimit: process.env.SQL_POOL_LIMIT,
};

if (process.env.INSTANCE_CONNECTION_NAME)
  options["socketPath"] = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
if (process.env.SQL_PORT) options["port"] = process.env.SQL_PORT;
if (process.env.SQL_HOST) options["host"] = process.env.SQL_HOST;

const pool = mysql.createPool(options);
var sessionStore = new MySQLStore(options, pool);

pool.query(`USE ${process.env.SQL_DATABASE}`);
console.log("Connected to DB successfuly");

const queryDB = (query, data_insert) => {
  return new Promise((data) =>
    pool.query(query, data_insert, (err, rows, fields) => {
      if (err) {
        console.log(err);
        data(false);
      } else {
        return data(rows);
      }
    })
  );
};

module.exports = { queryDB, sessionStore };
