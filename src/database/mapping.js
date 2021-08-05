// Where we define the mapping from saved json to db population
// file, table name, cols
const mapping = [
  ["buhub", "buhubs", "buhub_ID, buhub_name, buhub_creditsNeeded"],
  ["professors", "professors", "professor_ID, professor_name"],
  [
    "classes_parsed",
    "courses",
    "course_ID, course_title, course_code, course_college, course_department, course_number, course_semester, course_prereqs,course_coreqs,course_description,course_credits,course_prereqs_ids",
  ],
  [
    "sections",
    "sections",
    "section_ID, section_code, professor_ID, section_start, section_end, section_days, course_ID, section_type,section_building,section_room",
  ],
  ["classHubRelation", "coursesVShubs", "course_ID, buhub_ID"],
  ["majors", "majors", "major_ID, major_name"],
];

module.exports = mapping;
