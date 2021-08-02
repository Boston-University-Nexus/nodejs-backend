const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");

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

SamlOptions.decryptionPvk = fs.readFileSync(
  __dirname + "/../../cert/shib-key.pem",
  "utf8"
);
SamlOptions.privateCert = fs.readFileSync(
  __dirname + "/../../cert/shib-key.pem",
  "utf8"
);
SamlOptions.cert = fs.readFileSync(
  __dirname + "/../../cert/shib-idp-cert.pem",
  "utf8"
);

const samlStrategy = new SamlStrategy(SamlOptions, (profile, done) =>
  done(null, profile)
);

passport.use(samlStrategy);

module.exports = { samlStrategy };
