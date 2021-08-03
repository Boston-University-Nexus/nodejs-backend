const { Router } = require("express");
const router = Router();
const fs = require("fs");
const { queryDB } = require("../database/db");
const {
  courseToID,
  IDToCourse,
  checkPrereqs,
  remainingHubs,
  bestClassesHubs,
} = require("./functions");
const parseMajorPath = require("./major");
const pathToIds = require("./parseToIds");

// REMOVE TAKEN COURSE
const removeTaken = (all_courses, taken_ids) => {
  return all_courses.filter((a) => !taken_ids.includes(a.course_ID));
};

// REMOVE COURSES BY PREREQUIREMENTS
const removePrereqs = async (all_courses, taken_ids) => {
  return all_courses.filter((a) => {
    return a.course_prereqs == "" || checkPrereqs(a.course_prereqs, taken_ids);
  });
};

// GET BEST HUBS
const getBestHubPath = async (all_courses_ids, taken_ids, prev_paths, num) => {
  const remaining = await remainingHubs(taken_ids);
  const goodCourses = await bestClassesHubs(
    remaining,
    all_courses_ids,
    prev_paths
  );
  const chosenCourse = goodCourses[0].course_ID;

  if (num > 1) {
    const res = await getBestHubPath(
      all_courses_ids,
      taken_ids,
      prev_paths.concat(chosenCourse),
      num - 1
    );
    return res.concat(chosenCourse);
  }
  return [chosenCourse];
};

// GET BEST MAJOR
const getBestMajor = async (available_courses_ids, taken_ids, major) => {
  const major_paths_raw = fs.readFileSync(
    __dirname + "/../data/result/major_paths.json"
  );
  const major_path = JSON.parse(major_paths_raw)[major];
  const major_path_ids = await pathToIds(major_path);

  return parseMajorPath(available_courses_ids, taken_ids, major_path_ids);
};

// MAIN ALGO
const generateRecommendedSchedules = async (taken) => {
  const t0 = performance.now();

  // Algo config
  const NUM_HUB_LISTS = 3;

  // Testing
  const major = "Biochemistry & Molecular Biology";

  // Filtering all courses
  const taken_ids = await courseToID(taken);
  const all_courses = await queryDB(
    "SELECT course_ID, course_prereqs, course_code FROM courses"
  );
  const not_taken = removeTaken(all_courses, taken_ids);
  const available_courses = await removePrereqs(not_taken, taken_ids);
  const available_courses_ids = available_courses.map((a) => a.course_ID);

  // Getting hubs
  var best_hub_paths = [];
  for (let i = 0; i < NUM_HUB_LISTS; i++) {
    hub_path = await getBestHubPath(
      available_courses_ids,
      taken_ids,
      [...best_hub_paths],
      3
    );
    best_hub_paths.push(hub_path);
  }

  const best_major_list = await getBestMajor(
    available_courses_ids,
    taken_ids,
    major
  );
  console.log(best_major_list);

  var t1 = performance.now();

  // TEST
  console.log("CLASSES TAKEN:", taken);
  for (const hub_path of best_hub_paths)
    console.log("HUB PATH:", await IDToCourse(hub_path));
  console.log("BEST MAJOR:", await IDToCourse(best_major_list));
  console.log("Call to algo generation took " + (t1 - t0) / 1000 + " seconds.");

  return {
    hub1: await IDToCourse(best_hub_paths[0]),
    hub2: await IDToCourse(best_hub_paths[1]),
    hub3: await IDToCourse(best_hub_paths[2]),
    major: await IDToCourse(best_major_list),
  };
};

router.get("/", async (req, res) => {
  const taken =
    "CASCS111,CASCS112,CASWR112,CASWR120,CASCC111,CASPH100,CASMA123,CASMA124";
  const result = await generateRecommendedSchedules(
    "CASBI108,CASBI552,CASCH525,CASBI213"
  );

  res.status(200).json(result);
});

module.exports = router;
