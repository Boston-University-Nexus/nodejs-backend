const { Router } = require("express");
const router = Router();

const fs = require("fs");
const queryDB = require("../database/db");
const {
  courseToID,
  checkPrereqs,
  remainingHubs,
  bestClassesHubs,
} = require("./functions");

// REMOVE TAKEN COURSE
const removeTaken = (all_courses, taken_ids) => {
  let arr = [];

  for (const row of all_courses) {
    if (!taken_ids.includes(row.course_ID)) {
      arr.push(row);
    }
  }

  return arr;
};

// REMOVE COURSES BY PREREQUIREMENTS
const removePrereqs = async (all_courses, taken_ids) => {
  let arr = [];

  for (const row of all_courses) {
    if (row.course_prereqs == "") {
      arr.push(row);
    } else if (await checkPrereqs(row.course_prereqs, taken_ids)) {
      arr.push(row);
    }
  }

  return arr;
};

// GET BEST HUBS
const getBestHubPath = async (all_courses, taken_ids, prev_paths) => {
  const remaining = await remainingHubs(taken_ids);
  const goodClasses = await bestClassesHubs(remaining, all_courses);
};

// MAIN ALGO
const generateRecommendedSchedules = async (taken) => {
  // Algo config
  const NUM_HUB_LISTS = 1;

  // Testing
  const major = "Computer Science";
  const college = "CAS";

  const taken_ids = await courseToID(taken);
  const all_courses = await queryDB(
    "SELECT course_ID, course_prereqs FROM courses"
  );

  const not_taken = removeTaken(all_courses, taken_ids);
  const available_courses = await removePrereqs(not_taken, taken_ids);

  // Getting hubs
  var best_hub_list = [];
  for (let i = 0; i < NUM_HUB_LISTS; i++) {
    hub_path = getBestHubPath(available_courses, taken_ids, best_hub_list);
    best_hub_list.push(hub_path);
  }
};

router.get("/", async (req, res) => {
  const result = await generateRecommendedSchedules(
    "CASCS111,CASCS112,CASWR112,CASWR120,CASCC111,CASPH100,CASMA123,CASMA124"
  );

  res.status(200).send();
});

module.exports = router;
