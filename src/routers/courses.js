const { Router } = require("express");
const queryDB = require("../database/db");

const router = Router();

router.get("/", async (req, res) => {
  let result = await queryDB("SELECT * FROM courses;");
  res.send(result);
});

router.get("/:code", async (req, res) => {
  const classCode = req.params.code;
  let result = await queryDB(
    "SELECT * FROM courses WHERE course_code=?",
    classCode
  );
  res.send(result);
});

module.exports = router;
