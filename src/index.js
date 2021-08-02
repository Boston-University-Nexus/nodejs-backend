require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const { sessionStore } = require("./database/db");

// Security
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: function (req, res) {
    return res.status(429).json({
      error: "You sent too many requests. Please wait a while then try again",
    });
  },
});

// Config
const app = express();
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.PRODUCTION ? "combined" : "dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // One day
    },
  })
);
require("./auth/config");
app.use(passport.initialize());
app.use(passport.session());
app.use((err, req, res, next) => {
  // Error handling
  console.error("Fatal error: " + JSON.stringify(err));
  next(err);
});
app.use("/", require("./routers"));

// Server start with multiple cores
const cluster = require("cluster");
const os = require("os");
const numCpu = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCpu; i++) cluster.fork();
  cluster.on("exit", (wker, code, sig) => cluster.fork());
} else app.listen(process.env.PORT || 8000);
