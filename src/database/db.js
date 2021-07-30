const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
});

connection.connect((err) => {
  if (err) console.log("Error connecting to DB", err);
  else {
    connection.query("USE sampleDB");
    console.log("Connected to DB successfuly");
  }
});

const queryDB = (query, data_insert) => {
  return new Promise((data) =>
    connection.query(query, data_insert, (err, rows, fields) => {
      if (err) {
        console.log("Error querying DB", err);
        data([]);
      } else {
        return data(rows);
      }
    })
  );
};

module.exports = queryDB;
