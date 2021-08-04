const { Router } = require("express");
const { queryDB } = require("../database/db");

const { applyQueryAsFilters, errOrRes } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  const allowed_queries = [
    "course_code",
    "course_college",
    "course_department",
    "course_number",
    "course_code_contains",
    "course_college_contains",
    "course_department_contains",
    "course_number_contains",
    "course_title_contains",
  ];

  const { page } = req.query;
  let [params, query] = applyQueryAsFilters(req.query, allowed_queries, page);
  const result = await queryDB(
    "SELECT * FROM courses WHERE 1=1" + query,
    params
  );

  errOrRes(
    res,
    result,
    400,
    200,
    "No classes found matching that query.",
    result
  );
});

module.exports = router;
