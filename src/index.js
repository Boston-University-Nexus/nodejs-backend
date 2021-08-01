require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");

// Config
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
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
app.use("/", require("./routers/index"));

// Server start
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server on port ${process.env.PORT || 8000}`);
});
