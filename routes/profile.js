const express = require("express");
const app = require("../server");
const router = express.Router();
const { requiresAuth } = require("express-openid-connect");
const axios = require("axios");
const { getUserProfile, updateUserProfile } = require("../util/auth0methods");

router.get("/", requiresAuth(), async (req, res) => {
  try {
    if (req.oidc.isAuthenticated() && !req.oidc.accessToken.isExpired()) {
      let userInfo = await req.oidc.fetchUserInfo();
      const id_token = req.oidc.idTokenClaims;

      if (req.query.update === "linked") {
        //get linked providers from user object.
        var response = await getUserProfile(userInfo);
        if (response.status === 200) {
          let updatedProfile = await updateUserProfile(
            response.message,
            userInfo.sub
          );
          if (updatedProfile.status === 200) {
            let accessToken = req.oidc.accessToken;
            accessToken = await accessToken.refresh();
            userInfo = await req.oidc.fetchUserInfo();
            console.log(req.oidc.idTokenClaims);
          }
        }
      }

      var listOfClients;
      if (
        userInfo.listOfClients === undefined ||
        userInfo.listOfClients === null
      ) {
        listOfClients = [];
      } else {
        listOfClients = userInfo.listOfClients;
      }

      // console.log(req.oidc.idTokenClaims);

      var linkedAccounts = [];
      if (req.oidc.idTokenClaims.linked_providers != null) {
        req.oidc.idTokenClaims.linked_providers.forEach((element) => {
          if (element === "google-oauth2") {
            linkedAccounts.push("google");
          } else {
            linkedAccounts.push(element);
          }
        });
      }

      console.log(userInfo);

      res.render("pages/profile", {
        hasSession: true,
        title: "Profile",
        userInfo: userInfo,
        listOfClients,
        linkedAccounts,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
