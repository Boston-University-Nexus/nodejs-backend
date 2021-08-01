const passport = require("passport");
const { samlStrategy } = require("./config");
const { Router } = require("express");
const router = Router();

router.get("/whoami", (req, res, next) => {
  if (req.isAuthenticated()) return res.status(200).json({ user: req.user });
  else return res.status(401).json({ messsage: "User is not authenticated" });
});

router.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (req, res) => res.redirect("/")
);

router.post(
  "/login/callback",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (req, res) => res.redirect("/")
);

router.get("/login/fail", (req, res) => res.status(401).send("Login failed"));

router.get("/shibboleth/metadata", (req, res) => {
  res.type("application/xml");
  let cert = JSON.parse(`"${process.env.SHIBBOLETH_CERT}"`);

  res
    .status(200)
    .send(samlStrategy.generateServiceProviderMetadata(cert, cert));
});

module.exports = {
  authRouter: router,
};
