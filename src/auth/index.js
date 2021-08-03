const passport = require("passport");
const { samlStrategy, genToken } = require("./config");
const { Router } = require("express");
const router = Router();
const fs = require("fs");
const manageUsers = require("./users");

// ENDPOINTS
router.get(
  "/whoami",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    console.log("authenticated");
    res.status(200).json({ user: req.user });
  }
);

const redirectWithToken = async (req, res) => {
  const user = await manageUsers(req.user);
  const { jwt_token, maxAge } = genToken(user);

  res.cookie("jwt", jwt_token, {
    httpOnly: true,
    encode: String,
    secure: process.env.PRODUCTION || false,
    maxAge,
  });
  return res.redirect(301, process.env.CLIENT);
};

// If user is logged in already with JWT
router.get(
  "/login",
  passport.authenticate("jwt", {
    failureRedirect: "/login/shib",
    successRedirect: process.env.CLIENT,
    session: false,
  })
);

// If no JWT, check SHIB
router.get(
  "/login/shib",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  redirectWithToken
);

// If user just logged in
router.post(
  "/login/callback",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  redirectWithToken
);

// If something went wrong
router.get("/login/fail", (req, res) => res.status(401).send("Login failed"));

router.get("/login/test", async (req, res) => {
  req.user = {
    fname: "Daniel",
    lname: "Melchor",
    displayName: "Daniel S Melchor",
    email: "dmelchor@bu.edu",
    buID: "U29698781",
  };
  redirectWithToken(req, res);
});

// Logout of JWT
router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.cookie("jwt", "", { httpOnly: true, encode: String, maxAge: 0 });
    return res.redirect(301, process.env.CLIENT);
  }
);

// Obtain shib metadata
router.get("/shibboleth/metadata", (req, res) => {
  res.type("application/xml");
  let cert = fs.readFileSync(__dirname + "/../../cert/shib-cert.pem", "utf8");

  res
    .status(200)
    .send(samlStrategy.generateServiceProviderMetadata(cert, cert));
});

module.exports = {
  authRouter: router,
};
