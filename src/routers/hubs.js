const { Router } = require("express");
const queryDB = require("../database/db");

const router = Router();

router.get("/", async (req, res) => {
  let result = await queryDB("SELECT * FROM buhubs;");
  res.send(result);
});

router.get("/:code", async (req, res) => {});

module.exports = router;
