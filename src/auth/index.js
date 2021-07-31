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

module.exports = {
  ensureAuthenticated,
  passport,
};
