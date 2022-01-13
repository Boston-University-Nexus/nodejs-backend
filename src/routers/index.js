const { Router } = require("express");
const router = Router();
const passport = require("passport");

const coursesRouter = require("./courses");
const schedulesRouter = require("./schedules");
const hubsRouter = require("./hubs");
const sectionsRouter = require("./sections");
const professorsRouter = require("./professors");
const ratingsRouter = require("./ratings");
const algoRouter = require("../algo/algo");
const { authRouter } = require("../auth/index");

router.use("/courses", coursesRouter);

router.use(
  "/schedules",
  // passport.authenticate("jwt", { session: false }),
  schedulesRouter
);

router.use("/hubs", hubsRouter);

router.use("/sections", sectionsRouter);

router.use("/professors", professorsRouter);

router.use(
  "/ratings",
  // passport.authenticate("jwt", { session: false }),
  ratingsRouter
);

router.use(
  "/algo",
  // passport.authenticate("jwt", { session: false }),
  algoRouter
);

router.use("/", authRouter);

module.exports = router;
