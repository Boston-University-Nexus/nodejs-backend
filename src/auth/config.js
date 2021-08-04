const passport = require("passport");
const fs = require("fs");
const manageUsers = require("./users");

// Saml imports
const SamlStrategy = require("passport-saml").Strategy;
// Jwt imports
const jwt = require("jsonwebtoken");
var JWTStrategy = require("passport-jwt").Strategy;
const PRIV_KEY = fs.readFileSync(
  __dirname + "/../../cert/jwtRS256.key",
  "utf8"
);
const PUB_KEY = fs.readFileSync(
  __dirname + "/../../cert/jwtRS256.key.pub",
  "utf8"
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// SAML AUTHENTICATION
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

const samlStrategy = new SamlStrategy(SamlOptions, async (profile, done) =>
  done(null, profile)
);

// JWT AUTHENTICATION
const genToken = (user) => {
  const maxAge = 1000 * 60 * 60;
  const jwt_token = jwt.sign(
    {
      iss: "BUNexus",
      sub: user,
      iat: new Date().getTime(),
      exp: new Date().getTime() + 1000 * 60 * 60,
    },
    PRIV_KEY,
    { algorithm: "RS256" }
  );

  return { maxAge, jwt_token };
};

const cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies) token = req.cookies["jwt"];
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: PUB_KEY,
};

const jwtStrategy = new JWTStrategy(options, (jwt_payload, done) => {
  if (jwt_payload.exp < new Date().getTime()) return done(null, false);
  return done(null, jwt_payload.sub);
});

passport.use(samlStrategy);
passport.use(jwtStrategy);

// Exports
module.exports = { samlStrategy, jwtStrategy, genToken };
