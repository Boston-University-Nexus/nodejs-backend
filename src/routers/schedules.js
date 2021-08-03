const { Router } = require("express");
const { queryDB } = require("../database/db");
const { ensureAuthenticated } = require("../auth");

const { errOrRes } = require("./functions");

const router = Router();

// SEE SCHEDULES
router.get("/", async (req, res) => {
  let result = await queryDB(
    "SELECT schedule_sections FROM schedules WHERE user_ID=1"
  );

  let sections = [];
  for (const schedule of result)
    sections.push(JSON.parse(schedule.schedule_sections));

  errOrRes(
    res,
    result,
    404,
    200,
    "This schedule format isn't valid.",
    sections
  );
});

// SAVE SCHEDULE
router.post("/", async (req, res) => {
  const { schedule_data } = req.body;

  let user = (
    await queryDB(
      "SELECT user_ID, user_name, major_ID FROM users WHERE user_ID=?",
      1
    )
  )[0];

  let result = await queryDB(
    "INSERT INTO schedules (user_ID,schedule_sections) VALUES (?)",
    [[user.user_ID, JSON.stringify(schedule_data)]]
  );

  errOrRes(res, result, 400, 201, "This schedule format isn't valid.");
});

// DELETE SCHEDULE
router.delete("/", async (req, res) => {
  const { schedule_ID } = req.body;

  let result = await queryDB(
    "DELETE FROM schedules WHERE user_ID=? AND schedule_ID=?",
    [1, schedule_ID]
  );

  errOrRes(res, result, 400, 200, "That schedule doesn't exist.");
});

// UPDATE SCHEDULE
router.put("/", async (req, res) => {
  const { schedule_ID, schedule_data } = req.body;
  let data = [JSON.stringify(schedule_data), 1, schedule_ID];

  let result = await queryDB(
    "UPDATE schedules SET schedule_sections=? WHERE user_ID=? AND schedule_ID=?",
    data
  );

  errOrRes(res, result, 400, 201, "That schedule doesn't exist.");
});

module.exports = router;
