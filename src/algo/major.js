// Detects each part type depending on object keys
const getPartType = (part) => {
  if (part["choose"]) return "choose";
  else if (part["required"] && part["classes"]) return "normal";
  else if (part["options"]) return "options";
};

// Parses the default part of major reqs
const parseOptionsPart = (available_courses_ids, taken_ids, path) => {
  // This will store the selected courses
  var selectedCourses = [];

  console.log(path);
  var chosenPart = path[0];

  for (const part of chosenPart) {
    const type = getPartType(part);
    var left;

    if (type == "choose")
      left = parseChoosePart(available_courses_ids, taken_ids, part);
    else if (type == "normal")
      left = parseNormalPart(available_courses_ids, taken_ids, part);
    else if (type == "options")
      left = parseOptionsPart(
        available_courses_ids,
        taken_ids,
        part["options"]
      );

    selectedCourses = selectedCourses.concat(left);
    if (selectedCourses.length >= 3) return selectedCourses.slice(0, 3);
  }

  return selectedCourses;
};

// Parses the default part of major reqs
const parseNormalPart = (available_courses_ids, taken_ids, part) => {
  var required = part.required;

  if (required === -1) {
    var toComplete = part.classes.filter(
      (a) => !taken_ids.includes(a) && available_courses_ids.includes(a)
    );
    return toComplete;
  } else {
    var toComplete = part.classes.filter(
      (a) => !taken_ids.includes(a) && available_courses_ids.includes(a)
    );
    var completed = part.classes.filter((a) => taken_ids.includes(a));
    return toComplete.slice(0, required - completed.length);
  }
};

// Parses the choose part of major reqs
const parseChoosePart = (available_courses_ids, taken_ids, part) => {
  const choose = part.choose;
  var required = part.required;
  var available = part.classes.filter(
    (a) =>
      available_courses_ids.includes(a.course_ID) ||
      taken_ids.includes(a.course_ID)
  );

  var taken = {};
  for (const course of available) {
    if (taken_ids.includes(course.course_ID) && taken[course.course_department])
      taken[course.course_department] += 1;
    else if (
      taken_ids.includes(course.course_ID) &&
      !taken[course.course_department]
    )
      taken[course.course_department] = 1;
  }

  taken = Object.keys(taken).map((a) => [a, taken[a]]);
  var selectedAreas = taken
    .sort((a, b) => b[1] - a[1])
    .map((a) => a[0])
    .slice(0, choose);

  var countTaken = available.filter(
    (a) =>
      selectedAreas.includes(a.course_department) &&
      taken_ids.includes(a.course_ID)
  ).length;

  if (countTaken < required || required === -1)
    return (canTake = available.filter((a) => {
      return (
        selectedAreas.includes(a.course_department) &&
        !taken_ids.includes(a.course_ID)
      );
    })).map((a) => a.course_ID);
  return [];
};

// MAIN METHOD
const parseMajorPath = async (available_courses_ids, taken_ids, path) => {
  // This will store the selected courses
  var selectedCourses = [];

  for (const part of path) {
    const type = getPartType(part);
    var left;

    if (type == "choose")
      left = parseChoosePart(available_courses_ids, taken_ids, part);
    else if (type == "normal")
      left = parseNormalPart(available_courses_ids, taken_ids, part);
    else if (type == "options")
      left = parseOptionsPart(
        available_courses_ids,
        taken_ids,
        part["options"]
      );

    if (left) {
      selectedCourses = selectedCourses.concat(left);
    }
    if (selectedCourses.length >= 3) return selectedCourses.slice(0, 3);
  }

  return selectedCourses;
};

module.exports = parseMajorPath;
