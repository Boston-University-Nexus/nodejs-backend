const { Router } = require("express");
const { queryDB } = require("../database/db");

const { applyQueryAsFilters, errOrRes } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  const allowed_queries = [
    "course_code",
    "course_ID",
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
  const addOns = [
    "courses.",
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
  const { page } = req.query;

  let [params, query] = applyQueryAsFilters(
    req.query,
    allowed_queries,
    page,
    addOns
  );

  let result = await queryDB(
    "SELECT * FROM sections LEFT JOIN courses ON sections.course_ID=courses.course_ID LEFT JOIN professors ON sections.professor_ID=professors.professor_ID WHERE 1=1" +
      query,
    params
  );

  errOrRes(res, result, 400, 200, "No sections matching that query.", result);
});

module.exports = router;
