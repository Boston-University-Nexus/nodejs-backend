const { Router } = require("express");
const router = Router();

const cors = require("cors");
const whitelist = ["http://localhost:3000", "http://localhost:8080"];
const corsConfig = {
  credentials: true,
  origin: (origin, callback) => {
    callback(null, whitelist.indexOf(origin) !== -1);
  },
};

const coursesRouter = require("./courses");
const schedulesRouter = require("./schedules");
const hubsRouter = require("./hubs");
const sectionsRouter = require("./sections");
const professorsRouter = require("./professors");
const ratingsRouter = require("./ratings");
const algoRouter = require("../algo/algo");
const { authRouter } = require("../auth/index");

router.use("/courses", cors(corsConfig), coursesRouter);
router.use("/schedules", cors(corsConfig), schedulesRouter);
router.use("/hubs", cors(corsConfig), hubsRouter);
router.use("/sections", cors(corsConfig), sectionsRouter);
router.use("/professors", cors(corsConfig), professorsRouter);
router.use("/ratings", cors(corsConfig), ratingsRouter);
router.use("/algo", cors(corsConfig), algoRouter);
router.use("/", authRouter);

module.exports = router;
