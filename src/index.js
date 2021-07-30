require("dotenv").config();

// Express app + cors
const express = require("express");
var cors = require("cors");

const app = express();

const morgan = require("morgan");

// Config
app.use(cors());
app.set("port", process.env.PORT || 8000);

// Routes
const coursesRouter = require("./routers/courses");
const calendarsRouter = require("./routers/calendars");
const hubsRouter = require("./routers/hubs");

app.use("/api/courses", coursesRouter);
app.use("/api/calendars", calendarsRouter);
app.use("/api/hubs", hubsRouter);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Server start
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
