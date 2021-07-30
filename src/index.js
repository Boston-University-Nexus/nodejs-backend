require("dotenv").config();

// Express app + cors
const express = require("express");
var cors = require("cors");

const app = express();

const morgan = require("morgan");

// Config
app.use(cors());
app.use(express.json());
app.set("port", process.env.PORT || 8000);

// Routes
const coursesRouter = require("./routers/courses");
const calendarsRouter = require("./routers/calendars");
const hubsRouter = require("./routers/hubs");
const sectionsRouter = require("./routers/sections");
const professorsRouter = require("./routers/professors");
const ratingsRouter = require("./routers/ratings");

app.use("/courses", coursesRouter);
app.use("/calendars", calendarsRouter);
app.use("/hubs", hubsRouter);
app.use("/sections", sectionsRouter);
app.use("/professors", professorsRouter);
app.use("/ratings", ratingsRouter);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Server start
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
