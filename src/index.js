require("dotenv").config();

// Express app + cors
const express = require("express");
const cors = require("cors");

// Auth with SAML + Passport
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;

const app = express();
const morgan = require("morgan");

// Auth settings
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const SamlOptions = {
  // URL that goes from the Identity Provider -> Service Provider
  callbackUrl: process.env.CALLBACK_URL,
  // URL that goes from the Service Provider -> Identity Provider
  entryPoint: process.env.ENTRY_POINT,
  // Usually specified as `/shibboleth` from site root
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

// Config
app.use(cors());
app.use(express.json());
app.set("port", process.env.PORT || 8000);
app.use(passport.initialize());

// Authentication for routes
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  else return res.redirect("/login");
};

// Testing auth
app.get("/", ensureAuthenticated, (req, res) => res.send("Authenticated"));
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
