const express = require("express");
const app = require("../server");
const router = express.Router();
const { requiresAuth } = require("express-openid-connect");
const axios = require("axios");
const {
  createClient,
  attachClentGrants,
  updateUser,
  deleteClient,
  updateListOfClients,
} = require("../util/auth0methods");

router.get("/", requiresAuth(), async (req, res) => {
  try {
    if (req.oidc.isAuthenticated() && !req.oidc.accessToken.isExpired()) {
      const userInfo = await req.oidc.fetchUserInfo();
      if (process.env.DEBUG === true) {
        console.log(userInfo);
      }
      res.render("pages/api", {
        hasSession: true,
        title: "API",
        accessToken: req.oidc.accessToken.access_token,
        idToken: req.oidc.idToken,
        userInfo: userInfo,
      });
    } else {
      res.render("pages/api", {
        title: "API",
        hasSession: false,
      });
    }
  } catch (e) {
    console.error(e);
    res.send(e);
  }
});

router.post("/", requiresAuth(), async (req, res) => {
  try {
    var userInfo = await req.oidc.fetchUserInfo();
    //get AccessToken to call Auth0 APIs
    var options = {
      method: "POST",
      url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/oauth/token`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        client_id: process.env.AUTH0_API_CLIENT_ID,
        client_secret: process.env.AUTH0_API_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      },
    };
    var results = await axios(options);
    const { token_type, access_token, scope } = results.data;

    let client_metadata = { app_owner: userInfo.sub };
    var { status, data: clientInfo } = await createClient(
      access_token,
      req.body.app_name,
      client_metadata,
      userInfo.sub
    );

    //after client is create, now create a client grant to link app to API
    var scopes = ["read:users", "write:users"];
    var audience = "http://localhost:8000";
    var clientGrants = await attachClentGrants(
      access_token,
      clientInfo.client_id,
      audience,
      scopes
    );

    if (clientGrants.status === 201) {
      var userStatus = await updateUser(access_token, clientInfo, userInfo);
      console.log(userInfo);
      if (userStatus.status === 200) {
        console.log("Check user metadata");
        let accessToken = req.oidc.accessToken;
        accessToken = await accessToken.refresh();
      }
    }

    var message = {
      status: 200,
      message: {
        client_id: clientInfo.client_id,
        client_secret: clientInfo.client_secret,
      },
    };
    res.send(message);
  } catch (e) {
    console.error(e);
    res.send(e);
  }
});

router.delete("/", requiresAuth(), async (req, res) => {
  var userInfo = await req.oidc.fetchUserInfo();
  //get AccessToken to call Auth0 APIs
  var options = {
    method: "POST",
    url: `https://${process.env.AUTH0_ISSUER_DOMAIN}/oauth/token`,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      client_id: process.env.AUTH0_API_CLIENT_ID,
      client_secret: process.env.AUTH0_API_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_ISSUER_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    },
  };
  var results = await axios(options);
  const { token_type, access_token, scope } = results.data;

  let clientResults = await deleteClient(access_token, req.body.client_id);
  
  if(clientResults.status === 204){
    var userUpdateResults = await updateListOfClients(access_token, req.body.client_id, userInfo)
    if(userUpdateResults.status === 200) {
      let accessToken = req.oidc.accessToken;
      accessToken = await accessToken.refresh();
      res.send(clientResults);
    }
    
  }

  
});

module.exports = router;
