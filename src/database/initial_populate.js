const structure = require("./structure");
const mapping = require("./mapping");
const fs = require("fs");
require("dotenv").config();

// CONFIG
const DROP_TABLES = true;
const CREATE_TABLES = true;
const POPULATE_TABLES = true;
const PREPRODUCTION = true;

// MYSQL Connection
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
});

const queryDB = (query, data_insert) => {
  return new Promise((data) =>
    connection.query(query, [data_insert], (err, rows, fields) => {
      if (err) {
        console.log(err);
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
    let struct_str = "";
    for (const col of Object.keys(table[1]))
      struct_str += col + " " + table[1][col] + ", ";
    struct_str += table[2];
    await createTable(table[0], struct_str);
  }
};

// Loop to populate all tables
const populateTables = async () => {
  for (const table of mapping) {
    let raw = fs.readFileSync(`src/data/result/${table[0]}.json`);
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

    if (PREPRODUCTION) {
      await queryDB(
        "INSERT INTO users (major_ID,user_name,user_password,user_year,user_taken) VALUES (1,'admin','admin','SOPH','CASCS111,CASCS111,CASCS131,CASWR112,CASWR120,CASPH100,CASCC111')"
      );
      await queryDB(
        "INSERT INTO schedules (user_ID, schedule_sections) VALUES (1,?)",
        [
          '{"sections":[{"id":178,"days":"Mon,Wed,Fri","room":"","start":"13:25:00","end":"14:15:00","type":"Lecture","title":"CASAS100 A1","professor":"Michael Mendillo"},{"id":179,"days":"Mon","room":"","start":"14:30:00","end":"15:20:00","type":"Discussion","title":"CASAS100 A2","professor":"Michael Mendillo"},{"id":1564,"days":"Tue,Thu","room":"","start":"11:00:00","end":"12:15:00","type":"Lecture","title":"CASCS112 A1","professor":"Christine Papadakis-Kanaris"},{"id":1567,"days":"Fri","room":"","start":"09:05:00","end":"09:55:00","type":"Lab","title":"CASCS112 A3","professor":"Christine Papadakis-Kanaris"},{"id":1592,"days":"Tue,Thu","room":"","start":"14:00:00","end":"15:15:00","type":"Lecture","title":"CASCS132 A1","professor":"Abbas Attarwala"},{"id":1594,"days":"Mon","room":"","start":"09:05:00","end":"09:55:00","type":"Discussion","title":"CASCS132 A3","professor":"Abbas Attarwala"},{"id":2275,"days":"Mon,Wed,Fri","room":"","start":"10:10:00","end":"11:00:00","type":"Independent","title":"CASJS100 A1","professor":"Ingrid Anderson"}],"title":"Nexus Recommended"}',
        ]
      );
      await queryDB(
        "INSERT INTO schedules (user_ID, schedule_sections) VALUES (1,?)",
        [
          '{"sections":[{"id":178,"days":"Mon,Wed,Fri","room":"","start":"13:25:00","end":"14:15:00","type":"Lecture","title":"CASAS100 A1","professor":"Michael Mendillo"},{"id":179,"days":"Mon","room":"","start":"14:30:00","end":"15:20:00","type":"Discussion","title":"CASAS100 A2","professor":"Michael Mendillo"},{"id":1564,"days":"Tue,Thu","room":"","start":"11:00:00","end":"12:15:00","type":"Lecture","title":"CASCS112 A1","professor":"Christine Papadakis-Kanaris"},{"id":1567,"days":"Fri","room":"","start":"09:05:00","end":"09:55:00","type":"Lab","title":"CASCS112 A3","professor":"Christine Papadakis-Kanaris"},{"id":1592,"days":"Tue,Thu","room":"","start":"14:00:00","end":"15:15:00","type":"Lecture","title":"CASCS132 A1","professor":"Abbas Attarwala"},{"id":1594,"days":"Mon","room":"","start":"09:05:00","end":"09:55:00","type":"Discussion","title":"CASCS132 A3","professor":"Abbas Attarwala"}],"title":"Prioritize Major"}',
        ]
      );
      console.log("***************** CREATED TEST DATA *****************");
    }
  }
});
