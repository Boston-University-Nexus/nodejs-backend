const { Router } = require("express");
const queryDB = require("../database/db");

const { applyQueryAsFilters } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  if (Object.keys(req.query).length != 0) {
    let result = await queryDB("SELECT * FROM sections");
    res.send(result);
  } else {
    let allowed_queries = [
      "course_code",
      "course_college",
      "course_department",
      "course_number",
      "section_code",
      "course_code_contains",
      "course_college_contains",
      "course_department_contains",
      "course_number_contains",
      "section_code_contains",
      "professor_name",
      "professor_name_contains",
    ];
    let addOns = [
      "courses.",
      "courses.",
      "courses.",
      "courses.",
      "sections.",
      "courses.",
      "courses.",
      "courses.",
      "courses.",
      "sections.",
      "professors.",
      "professors.",
    ];

    let [params, query] = applyQueryAsFilters(
      req.query,
      allowed_queries,
      addOns
    );

    let result = await queryDB(
      "SELECT * FROM sections LEFT JOIN courses ON sections.course_ID=courses.course_ID LEFT JOIN professors ON sections.professor_ID=professors.professor_ID WHERE 1=1" +
        query,
      params
    );
    res.send(result);
  }
});

module.exports = router;
