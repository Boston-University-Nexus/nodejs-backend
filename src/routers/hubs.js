const { Router } = require("express");
const queryDB = require("../database/db");

const { applyQueryAsFilters, errOrRes } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    let result = await queryDB("SELECT * FROM buhubs");
    errOrRes(res, result, 400, 200, "No hubs found.", result);
  } else {
    const allowed_queries = ["course_code", "buhub_ID"];
    const addOns = ["courses.", "buhubs."];
    const { page } = req.query;

    let [params, query] = applyQueryAsFilters(
      req.query,
      allowed_queries,
      page,
      addOns
    );

    let result = await queryDB(
      "SELECT * FROM coursesVShubs LEFT JOIN courses ON coursesVShubs.course_ID=courses.course_ID LEFT JOIN buhubs ON coursesVShubs.buhub_ID=buhubs.buhub_ID WHERE 1=1" +
        query,
      params
    );

    errOrRes(
      res,
      result,
      400,
      200,
      "No hubs found matching that query.",
      result
    );
  }
});

module.exports = router;
