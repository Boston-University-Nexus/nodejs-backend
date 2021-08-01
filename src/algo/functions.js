const queryDB = require("../database/db");

const courseToID = async (str) => {
  const result = await queryDB(
    "SELECT course_ID FROM courses WHERE course_code IN (?)",
    [str.split(",")]
  );

  let arr = [];
  for (const row of result) arr.push(row.course_ID);

  return arr;
};

const checkPrereqs = async (target, taken) => {
  let prereqs = [];

  // Parse prereqs
  for (const prereq of target.split("|")) prereqs.push(prereq.split("&"));

  // Calculate completed
  for (const prereq_group of prereqs) {
    let group_completed = false;
    for (const prereq of prereq_group) {
      if (!taken.includes(parseInt(prereq))) {
        group_completed = true;
        break;
      }
    }

    if (group_completed) return true;
  }

  return false;
};

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

const bestClassesHubs = async (remaining, all_classes) => {
  let all_classes_ids = all_classes.map((a) => a.course_ID);

  const result = await queryDB(
    "SELECT course_ID,buhub_ID FROM coursesVShubs WHERE buhub_ID IN (?) AND course_ID IN (?)",
    [remaining, all_classes_ids]
  );

  let grouped = [];
  for (const row of result) {
    let found = false;
    for (const idx in grouped)
      if (grouped[idx][0] == row.course_ID) {
        grouped[idx][1].push(row.buhub_ID);
        found = true;
        break;
      }

    if (!found) grouped.push([row.course_ID, [row.buhub_ID]]);
  }

  grouped.sort((a, b) => {
    return b[1].length - a[1].length;
  });

  return grouped;
};

module.exports = {
  courseToID,
  checkPrereqs,
  remainingHubs,
  bestClassesHubs,
};
