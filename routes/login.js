/** 
 * This login page has been modified to allow for both passwordless and password options,
 * by looking at query parameters to determine which connection to leverage
 * SMS or Email
*/

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // req.query.connection === "sms" ||
  if ( req.query.connection === "email") {
    res.oidc.login({
      returnTo: "/profile",
      authorizationParams: {
        redirect_uri: `${process.env.BASE_URL}callback`,
        connection: req.query.connection,
        audience: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/`,
        scope: process.env.SCOPE,
      },
    });
  } else {
    res.oidc.login({
      returnTo: "/profile",
      authorizationParams: {
        redirect_uri: `${process.env.BASE_URL}callback`,
        audience: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/`,
        scope: process.env.SCOPE,
      },
    });
  }
});

module.exports = router;
