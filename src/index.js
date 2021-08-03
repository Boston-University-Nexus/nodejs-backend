require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
// Security
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 70,
  handler: function (req, res) {
    return res.status(429).json({
      error: "You sent too many requests. Please wait a while then try again",
    });
  },
});
const whitelist = process.env.WHITELIST;
const corsConfig = {
  credentials: true,
  origin: (origin, done) => {
    return done(null, whitelist === origin);
  },
};

// Config
const app = express();
app.enable("trust proxy"); // Required for SSL
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
}); // Required for authentication (disable cache)
app.use(helmet());
app.use(limiter);
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.PRODUCTION ? "combined" : "dev"));
require("./auth/config");
app.use(passport.initialize());
app.use((err, req, res, next) => {
  // Error handling
  console.error("Fatal error: " + JSON.stringify(err));
  next(err);
});
app.use("/", require("./routers"));

// Server start with multiple cores
// const cluster = require("cluster");
// const os = require("os");
// const numCpu = os.cpus().length;
// var children = [];
// var generateMoreChildren = false;

// if (cluster.isMaster) {
//   for (let i = 0; i < numCpu; i++) children.push(cluster.fork());
//   cluster.on("exit", (wker, code, sig) => {
//     if (generateMoreChildren) children.push(cluster.fork());
//   });
// } else app.listen(process.env.PORT || 8000);

// // Killing child processes
// const killChilds = () => {
//   console.log("Killing process children.");
//   generateMoreChildren = false;
//   children.forEach((child) => child.kill());
// };
// process.on("exit", killChilds);
// process.on("SIGINT", killChilds);
// process.on("SIGTERM", killChilds);

app.listen(process.env.PORT || 8000);
