const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  req.appSession.linking = { rootUserId: req.oidc.idTokenClaims.sub };
  res.render("pages/accountLinking", {
    rootUserId: req.oidc.idTokenClaims.sub,
    access_token: req.oidc.accessToken.access_token,
    auth0Domain: process.env.AUTH0_ISSUER_DOMAIN,
    auth0ClientID: process.env.AUTH0_CLIENT_ID,
  });
});

module.exports = router;
