const passport = require("passport");
const { samlStrategy, genToken } = require("./config");
const { Router } = require("express");
const router = Router();
const fs = require("fs");
const manageUsers = require("./users");
const { queryDB } = require("../database/db");

// ENDPOINTS
router.get(
  "/whoami",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.status(200).json({ user: req.user });
  }
);

// *****PRODUCTION MAKE SURE THEY ARE SAML AUTHENTICATED******
// *****PRODUCTION MAKE SURE THEY ARE SAML AUTHENTICATED******
// *****PRODUCTION MAKE SURE THEY ARE SAML AUTHENTICATED******
// *****PRODUCTION MAKE SURE THEY ARE SAML AUTHENTICATED******
const redirectWithToken = async (req, res, location) => {
  const user = await manageUsers(req.user);
  const { jwt_token, maxAge } = genToken(user);

  res.cookie("jwt", jwt_token, {
    httpOnly: true,
    encode: String,
    secure: process.env.PRODUCTION || false,
    maxAge,
  });

  location = location || "/callback" + "?key=" + user.user_key;

  return res.redirect(301, process.env.CLIENT + location);
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
    displayName: "Daniel S Melchor",
    email: "dmelchor@bu.edu",
    buID: "U29698781",
    user_buID: "U29698781",
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

// EXTENSION ENDPOINT
router.post("/extension", async (req, res) => {
  const { courses, buID, extensionKey, major, year } = req.body;
  var major_ID = await queryDB(
    "SELECT major_ID FROM majors WHERE major_name=?",
    major
  );

  // Find major by name (might be removed later)
  major_ID = major_ID[0].major_ID;

  const result = await queryDB(
    "UPDATE users SET user_taken=?, user_year=?, major_ID=? WHERE user_buID=? AND user_key=?",
    [courses, year, major_ID, buID, extensionKey]
  );

  if (result.affectedRows === 0)
    return res.status(400).json({
      error:
        "Please make sure the BU ID is correct, or log out and reconnect to BUNexus.",
    });
  return res.status(200).send("success");
});

// PROFILE EDIT ENDPOINT
router.post(
  "/user/edit",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.body.year) {
      // Change year
      const result = await queryDB(
        "UPDATE users SET user_year=? WHERE user_buID=?",
        [req.body.year, req.user.user_buID]
      );
      if (result.affectedRows !== 0)
        return redirectWithToken(req, res, "/profile");
      return res.status(400).json({
        error: "Please make sure the field and value being changed are valid.",
      });
    } else if (req.body.major) {
      // Change major
      var major_ID = await queryDB(
        "SELECT major_ID FROM majors WHERE major_name=?",
        req.body.major
      );

      // Find major by name (might be removed later)
      major_ID = major_ID[0].major_ID;

      const result = await queryDB(
        "UPDATE users SET major_ID=? WHERE user_buID=?",
        [major_ID, req.user.user_buID]
      );

      if (result.affectedRows !== 0)
        return redirectWithToken(req, res, "/profile");
      return res.status(400).json({
        error: "Please make sure the field and value being changed are valid.",
      });
    } else {
      return res.status(400).json({
        error: "Please make sure the field and value being changed are valid.",
      });
    }
  }
);

module.exports = {
  authRouter: router,
};
