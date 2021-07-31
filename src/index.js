require("dotenv").config();

// Express app + cors
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");

const app = express();

// Config
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("port", process.env.PORT || 8000);
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

const { ensureAuthenticated, passport } = require("./auth/index");

app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.get("/whoami", (req, res, next) => {
  if (req.isAuthenticated()) return res.status(200).json({ user: req.user });
  else return res.status(401).json({ messsage: "User is not authenticated" });
});

app.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (req, res) => res.redirect("/")
);

app.post(
  "/login/callback",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (req, res) => res.redirect("/")
);

app.get("/login/fail", (req, res) => res.status(401).send("Login failed"));

app.get("/shibboleth/metadata", (req, res) => {
  res.type("application/xml");
  let cert = JSON.parse(`"${process.env.SHIBBOLETH_CERT}"`);

  res
    .status(200)
    .send(samlStrategy.generateServiceProviderMetadata(cert, cert));
});

// Routes
const coursesRouter = require("./routers/courses");
const schedulesRouter = require("./routers/schedules");
const hubsRouter = require("./routers/hubs");
const sectionsRouter = require("./routers/sections");
const professorsRouter = require("./routers/professors");
const ratingsRouter = require("./routers/ratings");

app.use("/courses", coursesRouter);
app.use("/schedules", schedulesRouter);
app.use("/hubs", hubsRouter);
app.use("/sections", sectionsRouter);
app.use("/professors", professorsRouter);
app.use("/ratings", ratingsRouter);

// Server start
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
