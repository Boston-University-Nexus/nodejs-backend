const { Router } = require("express");
const { queryDB } = require("../database/db");

const { applyQueryAsFilters, errOrRes } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  const allowed_queries = ["professor_name", "professor_name_contains"];
  const { page } = req.query;

  let [params, query] = applyQueryAsFilters(req.query, allowed_queries, page);

  let result = await queryDB(
    "SELECT * FROM professors WHERE 1=1" + query,
    params
  );
  errOrRes(
    res,
    result,
    400,
    200,
    "No professors found matching that query.",
    result
  );
});

module.exports = router;
