const fs = require("fs");
require("dotenv").config();

const raw = fs.readFileSync("src/data/result/classes.json");
const courses = JSON.parse(raw);

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
  let fixed = [];
  for (const prereq_group of course.split("|")) {
    let fixed_group = [];
    for (const prereq of prereq_group.split("&")) {
      let result = false;

      if (prereq.length == 5) {
        result = (
          await queryDB(
            "SELECT course_ID FROM courses WHERE course_department=? AND course_number=?",
            [prereq.substring(0, 3), prereq.substring(3, 5)]
          )
        )[0];
      } else if (prereq.length == 8) {
        result = (
          await queryDB(
            "SELECT course_ID FROM courses WHERE course_college=? AND course_department=? AND course_number=?",
            [
              prereq.substring(0, 3),
              prereq.substring(3, 5),
              prereq.substring(5, 8),
            ]
          )
        )[0];
      }

      if (result) fixed_group.push(result.course_ID);
    }
    if (fixed_group.length > 0) fixed.push(fixed_group);
  }

  //Convert to str
  let result = "";
  for (const prereq_group of fixed) {
    let group = "";
    for (const prereq of prereq_group) {
      group += prereq + "&";
    }
    result += group.substring(0, group.length - 1) + "|";
  }

  result = result.substring(0, result.length - 1);

  return result;
};

connection.connect(async (err) => {
  if (err) console.log("Error connecting to DB", err);
  else {
    let final_arr = [];

    for (const idx in courses) {
      let copy = [...courses[idx]];
      if (copy[7].length != 0) {
        copy[7] = await replaceCourse(copy[7]);
      }

      final_arr.push(copy);
      console.log(idx, "/", courses.length);
    }

    fs.writeFileSync("src/data/result/classes.json", JSON.stringify(final_arr));
  }
});
