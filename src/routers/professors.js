const { Router } = require("express");
const queryDB = require("../database/db");

const { applyQueryAsFilters } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    let result = await queryDB("SELECT * FROM professors");
    res.send(result);
  } else {
    let allowed_queries = ["professor_name", "professor_name_contains"];

    let [params, query] = applyQueryAsFilters(req.query, allowed_queries);

    let result = await queryDB(
      "SELECT * FROM professors WHERE 1=1" + query,
      params
    );
    res.send(result);
  }
});

module.exports = router;
