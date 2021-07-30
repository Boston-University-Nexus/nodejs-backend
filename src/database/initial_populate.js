const structure = require("./structure");
const mapping = require("./mapping");
const fs = require("fs");

// CONFIG
const DROP_TABLES = true;
const CREATE_TABLES = true;
const POPULATE_TABLES = true;

// MYSQL Connection
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_USERNAME,
  database: process.env.SQL_PASSWORD,
});

const queryDB = (query, data_insert) => {
  return new Promise((data) =>
    connection.query(query, [data_insert], (err, rows, fields) => {
      if (err) {
        data([]);
      } else {
        return data(rows);
      }
    })
  );
};

// Drop tables helper func
const dropTables = async () => {
  for (var i = structure.length; i--; ) {
    await queryDB(`DROP TABLE ${structure[i][0]};`);
  }
};

// Create tables helper func
const createTable = async (name, cols) => {
  const res = await queryDB(`CREATE TABLE ${name} (${cols});`);
  await queryDB(`ALTER TABLE ${name} AUTO_INCREMENT = 1;`);
  return res;
};

// Populate tables helper func
const populateTable = async (name, cols, data) => {
  return await queryDB(`INSERT INTO ${name} (${cols}) VALUES ?`, data);
};

// Loop to create all tables
const createTables = async () => {
  for (const table of structure) {
    await createTable(table[0], table[1]);
  }
};

// Loop to populate all tables
const populateTables = async () => {
  for (const table of mapping) {
    let raw = fs.readFileSync(`../data/resultJson/${table[0]}.json`);
    raw = JSON.parse(raw);

    const result = await populateTable(table[1], table[2], raw);
    if (result.length < 1) break;
  }
};

// Connect & operate
connection.connect(async (err) => {
  if (err) console.log("Error connecting to DB", err);
  else {
    console.log("Connected to DB successfuly");
    connection.query("USE sampleDB");

    if (DROP_TABLES) {
      await dropTables();
      await dropTables();
      console.log("***************** DROPPED TABLES *****************");
    }

    if (CREATE_TABLES) {
      await createTables();
      console.log("***************** CREATED NEW TABLES *****************");
    }

    if (POPULATE_TABLES) {
      await populateTables();
      console.log("***************** POPULATED TABLES *****************");
    }
  }
});
