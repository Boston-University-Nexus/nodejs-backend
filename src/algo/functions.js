const { queryDB } = require("../database/db");

// Parse an ID to a course (testing)
const IDToCourse = async (ids) => {
  var result = await queryDB(
    "SELECT course_code FROM courses WHERE course_ID IN (?)",
    [ids]
  );

  return result.map((a) => a.course_code);
};

// Parse a string or array of strings to course IDS
const courseToID = async (courses) => {
  var result;
  if (courses.length === 0) return [];

  if (typeof courses === "string") {
    result = await queryDB(
      "SELECT course_ID FROM courses WHERE course_code IN (?)",
      [courses.split(",")]
    );
  } else {
    result = await queryDB(
      "SELECT course_ID FROM courses WHERE course_code IN (?)",
      [courses]
    );
  }

  return result.map((a) => a.course_ID);
};

// Check a course prereqs (target) to see if user can take it (taken)
const checkPrereqs = (target, taken) => {
  let prereqs = [];

  // Parse prereqs
  prereqs = target.split("|").map((a) => a.split("&"));

  // Calculate completed
  for (const prereq_group of prereqs) {
    let group_completed = true;
    for (const prereq of prereq_group) {
      if (!taken.includes(parseInt(prereq))) {
        group_completed = false;
        break;
      }
    }

    if (group_completed) return true;
  }

  return false;
};

// Computs the hub areas the user has to take
const remainingHubs = async (taken) => {
  var all_hubs = await queryDB(
    "SELECT buhub_ID, buhub_creditsNeeded FROM buhubs"
  );

  for (const course of taken) {
    const course_hubs = await queryDB(
      "SELECT buhub_ID FROM coursesVShubs WHERE course_ID=?",
      course
    );

    for (const hub of course_hubs) {
      if (all_hubs[hub.buhub_ID - 1].buhub_creditsNeeded > 0)
        all_hubs[hub.buhub_ID - 1].buhub_creditsNeeded -= 1;
    }
  }

  let remaining = [];
  for (const hub of all_hubs)
    if (hub.buhub_creditsNeeded > 0) remaining.push(hub.buhub_ID);

  return remaining;
};

// Computes the best hub path a user can take given taken courses
const bestClassesHubs = async (remaining, all_classes, prev_paths) => {
  prev_paths = prev_paths.flat();
  all_classes = [...all_classes].filter((a) => !prev_paths.includes(a));

  const result = await queryDB(
    "SELECT coursesVShubs.course_ID, coursesVShubs.buhub_ID, courses.course_number FROM coursesVShubs LEFT JOIN courses ON coursesVShubs.course_ID = courses.course_ID WHERE coursesVShubs.buhub_ID IN (?) AND courses.course_ID IN (?)",
    [remaining, all_classes]
  );

  const res = result.reduce((acc, d) => {
    const found = acc.find((a) => a.course_ID === d.course_ID);

    if (!found)
      acc.push({
        course_ID: d.course_ID,
        numHubs: [d.buhub_ID],
        number: parseInt(d.course_number),
      });
    else found.numHubs.push(d.buhub_ID);

    return acc;
  }, []);

  res.sort((a, b) => {
    const diff = b.numHubs.length - a.numHubs.length;
    if (diff !== 0) return diff;
    return a.number - b.number;
  });

  return res;
};

module.exports = {
  courseToID,
  checkPrereqs,
  remainingHubs,
  bestClassesHubs,
  IDToCourse,
};
