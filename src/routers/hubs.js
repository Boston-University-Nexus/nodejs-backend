const { Router } = require("express");
const queryDB = require("../database/db");

const { applyQueryAsFilters } = require("./functions");

const router = Router();

router.get("/", async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    let result = await queryDB("SELECT * FROM buhubs");
    res.send(result);
  } else {
    let allowed_queries = ["course_code", "buhub_ID"];
    let addOns = ["courses.", "buhubs."];

    let [params, query] = applyQueryAsFilters(
      req.query,
      allowed_queries,
      addOns
    );

    let result = await queryDB(
      "SELECT * FROM coursesVShubs LEFT JOIN courses ON coursesVShubs.course_ID=courses.course_ID LEFT JOIN buhubs ON coursesVShubs.buhub_ID=buhubs.buhub_ID WHERE 1=1" +
        query,
      params
    );
    res.send(result);
  }
});

module.exports = router;
