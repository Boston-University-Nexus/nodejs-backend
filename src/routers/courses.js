const { Router } = require("express");
const queryDB = require("../database/db");

const { applyQueryAsFilters } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    let result = await queryDB("SELECT * FROM courses;");
    res.send(result);
  } else {
    let allowed_queries = [
      "course_code",
      "course_college",
      "course_department",
      "course_number",
      "course_code_contains",
      "course_college_contains",
      "course_department_contains",
      "course_number_contains",
    ];
    let [params, query] = applyQueryAsFilters(req.query, allowed_queries);

    let result = await queryDB(
      "SELECT * FROM courses WHERE 1=1" + query,
      params
    );
    res.send(result);
  }
});

module.exports = router;
