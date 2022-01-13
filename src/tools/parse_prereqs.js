const fs = require("fs");
require("dotenv").config();

const raw = fs.readFileSync("src/data/result/classes.json");
var courses = JSON.parse(raw);

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
    connection.query(query, data_insert, (err, rows, fields) => {
      if (err) {
        console.log(err);
        data([]);
      } else {
        return data(rows);
      }
    })
  );
};

const replaceCourse = async (course) => {
  // Replaces course string to course objects
  let fixed_codes = [];
  let fixed_ids = [];

  for (const prereq_group of course.split("|")) {
    let fixed_group_codes = [];
    let fixed_group_ids = [];

    for (const prereq of prereq_group.split("&")) {
      let result = false;

      if (prereq.length == 5) {
        result = (
          await queryDB(
            "SELECT course_ID, course_code FROM courses WHERE course_department=? AND course_number=?",
            [prereq.substring(0, 3), prereq.substring(3, 5)]
          )
        )[0];
      } else if (prereq.length == 8) {
        result = (
          await queryDB(
            "SELECT course_ID, course_code FROM courses WHERE course_college=? AND course_department=? AND course_number=?",
            [
              prereq.substring(0, 3),
              prereq.substring(3, 5),
              prereq.substring(5, 8),
            ]
          )
        )[0];
      }

      if (result) {
        fixed_group_codes.push(result.course_code);
        fixed_group_ids.push(result.course_ID);
      }
    }
    if (fixed_group_ids.length > 0) {
      fixed_codes.push(fixed_group_codes);
      fixed_ids.push(fixed_group_ids);
    }
  }

  return [fixed_codes, fixed_ids];
};

connection.connect(async (err) => {
  if (err) console.log("Error connecting to DB", err);
  else {
    for (const idx in courses) {
      let copy = courses[idx];
      if (copy[7].length != 0) {
        const [codes, ids] = await replaceCourse(copy[7]);
        copy[7] = JSON.stringify(codes);
        copy.push(JSON.stringify(ids));
      } else {
        copy[7] = JSON.stringify([]);
        copy.push(JSON.stringify([]));
      }

      console.log(idx, "/", courses.length);
    }

    fs.writeFileSync(
      "src/data/result/classes_parsed.json",
      JSON.stringify(courses)
    );
  }
});
