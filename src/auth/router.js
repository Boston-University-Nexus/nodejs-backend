const { Router } = require("express");
const router = Router();

const { passport } = require("./auth");

// Testing auth
router.get(
  "/",
  passport.authenticate("saml", { failureRedirect: "/fail" }),
  (req, res) => res.redirect("/")
);

router.post(
  "/callback",
  passport.authenticate("saml", { failureRedirect: "/fail" }),
  (req, res) => res.redirect("/")
);

router.get("/fail", (req, res) => res.status(401).send("Login failed"));

router.get("/metadata", (req, res) => {
  res.type("application/xml");
  let cert = JSON.parse(`"${process.env.SHIBBOLETH_CERT}"`);

  res
    .status(200)
    .send(samlStrategy.generateServiceProviderMetadata(cert, cert));
});

module.exports = router;
