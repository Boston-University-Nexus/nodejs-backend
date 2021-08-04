const mysql = require("mysql");

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

pool.query(`USE ${process.env.SQL_DATABASE}`);
console.log("Connected to DB successfuly");

const queryDB = (query, data_insert) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (!err) {
        return conn.query(query, data_insert, (err, rows, fields) => {
          if (err) {
            console.log(err);
            conn.release();
            reject(false);
          } else {
            conn.release();
            resolve(rows);
          }
        });
      } else console.log(err);
    });
  });
};

module.exports = { queryDB };
