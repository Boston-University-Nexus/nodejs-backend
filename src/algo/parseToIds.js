const { queryDB } = require("../database/db");
const { courseToID } = require("./functions");

// Parse encoded courses (EX: CASCS100+)
const formatToQuery = (type) => {
  if (type === "+")
    return "SELECT course_ID FROM courses WHERE course_number > ? AND course_college=? AND course_department=?";
  else if (type === "-")
    return "SELECT course_ID FROM courses WHERE course_number > ? AND course_number < ? AND course_college=? AND course_department=?";
};

// Query DB for encoded courses
const strangeCourseToID = async (courses) => {
  if (courses.length === 0) return [];

  var result = [];
  for (const course of courses) {
    var courseObject;
    if (course.includes("+")) {
      var query = formatToQuery("+");
      var data = [
        course.substring(5, 8),
        course.substring(0, 3),
        course.substring(3, 5),
      ];
    } else if (course.includes("-")) {
      var query = formatToQuery("-");
      var data = [
        course.substring(5, 8),
        course.substring(9, 12),
        course.substring(0, 3),
        course.substring(3, 5),
      ];
    }

    courseObject = await queryDB(query, data);
    result.push(courseObject);
  }

  return result.flat().map((a) => a.course_ID);
};

// Parse normal
const parseNormal = async (courses, exclude) => {
  // Divide between normal and encoded courses
  let clean = courses.map((a) => a.replaceAll(" ", ""));
  exclude = exclude || [];
  exclude = exclude.map((a) => a.replaceAll(" ", "")) || [];

  // Clean courses + exclude
  courses = clean.filter((a) => a.length === 8);
  let strangeCourses = clean.filter((a) => a.length !== 8);
  let coursesExclude = exclude.filter((a) => a.length === 8);
  let strangeCoursesExclude = exclude.filter((a) => a.length !== 8);

  // Get course IDs
  let normalIds = await courseToID(courses);
  let strangeIds = await strangeCourseToID(strangeCourses);
  let result = normalIds.concat(strangeIds);
  let normalExcludeIds = await courseToID(coursesExclude);
  let strangeExcludeIds = await strangeCourseToID(strangeCoursesExclude);
  let totalExclude = normalExcludeIds.concat(strangeExcludeIds);

  // Exclude courses if any
  if (totalExclude.length > 0)
    result = result.filter((a) => !totalExclude.includes(a));

  return result;
};

// Parse options (same as pathsToIds but for recursiveness)
const parseOptions = async (path) => {
  var options = [];

  for (const p of path) {
    var path_to_ids = [];
    for (const part of p) {
      if (part["choose"]) {
        // Parse departments
        let result = await queryDB(
          "SELECT course_ID, course_department FROM courses WHERE course_department IN (?)",
          [part["classes"]]
        );

        // Save
        var part_to_ids = { ...part, classes: result };
      } else if (part["required"] && part["classes"]) {
        const result = await parseNormal(part.classes, part.exclude);
        var part_to_ids = { ...part, classes: result };
      } else if (part["options"]) {
        const result = await parseOptions({ ...part["options"] });
        var part_to_ids = { options: result };
      }

      if (part_to_ids) path_to_ids.push(part_to_ids);
    }
    if (path_to_ids.length > 0) options.push(path_to_ids);
  }

  return options;
};

// Converts major paths to courses
const pathToIds = async (path) => {
  var path_to_ids = [];

  for (const part of path) {
    if (part["choose"]) {
      // Parse departments
      let result = await queryDB(
        "SELECT course_ID, course_department FROM courses WHERE course_department IN (?)",
        [part["classes"]]
      );

      // Save
      var part_to_ids = { ...part, classes: result };
    } else if (part["required"] && part["classes"]) {
      const result = await parseNormal(part.classes, part.exclude);
      var part_to_ids = { ...part, classes: result };
    } else if (part["options"]) {
      const result = await parseOptions(part["options"]);
      var part_to_ids = { options: result };
    }

    if (part_to_ids) path_to_ids.push(part_to_ids);
  }

  return path_to_ids;
};

module.exports = pathToIds;
