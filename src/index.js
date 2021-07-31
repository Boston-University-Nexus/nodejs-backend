require("dotenv").config();

// Express app + cors
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");

// Config
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("port", process.env.PORT || 8000);

// Authentication
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const SamlOptions = {
  callbackUrl: process.env.CALLBACK_URL,
  entryPoint: process.env.ENTRY_POINT,
  issuer: process.env.ISSUER,
  identifierFormat: null,
  validateInResponseTo: false,
  disableRequestedAuthnContext: true,
};

SamlOptions.decryptionPvk = JSON.parse(`"${process.env.SHIBBOLETH_KEY}"`);
SamlOptions.privateCert = JSON.parse(`"${process.env.SHIBBOLETH_KEY}"`);
SamlOptions.cert = JSON.parse(`"${process.env.SHIBBOLETH_IDP_CERT}"`);

const samlStrategy = new SamlStrategy(SamlOptions, (profile, done) =>
  done(null, profile)
);

passport.use(samlStrategy);

// Authentication for routes
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  else return res.redirect("/login");
};

const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.get(
  "/login/",
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
// const coursesRouter = require("./routers/courses");
// const calendarsRouter = require("./routers/calendars");
// const hubsRouter = require("./routers/hubs");
// const sectionsRouter = require("./routers/sections");
// const professorsRouter = require("./routers/professors");
// const ratingsRouter = require("./routers/ratings");

// app.use("/courses", coursesRouter);
// app.use("/calendars", calendarsRouter);
// app.use("/hubs", hubsRouter);
// app.use("/sections", sectionsRouter);
// app.use("/professors", professorsRouter);
// app.use("/ratings", ratingsRouter);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Server start
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
