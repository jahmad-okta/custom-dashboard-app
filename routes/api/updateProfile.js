const express = require("express");
const app = require("../../server");
const router = express.Router();
var axios = require("axios");
const { updateUserProfile } = require("../../util/auth0methods");

//Path /api/updateProfile

router.get("/", async (req, res) => {
  res.send({ status: 200, message: "Update Profile" });
});

router.post("/", async (req, res) => {
  var data = { user_metadata: {} };
  Object.keys(req.body).forEach((key) => {
    if (
      key === "given_name" ||
      key === "family_name" ||
      key === "email" ||
      key === "picture"
    ) {
      data[key] = req.body[key];
    } else if (key === "app_metadata") {
      data.app_metadata = req.body[key];
    } else {
      data.user_metadata[key] = req.body[key];
    }
  });

  if (Object.keys(data.user_metadata).length === 0) {
    delete data.user_metadata;
  }
  // console.log(data);

  //Get Access token to call management APIs
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

  const { status, message } = await updateUserProfile(data, req.query.sub);

  if (status === 200) {
    let accessToken = req.oidc.accessToken;
    accessToken = await accessToken.refresh();
    res.send({ message: "Profile is Updates", status: 200 });
  } else {
    res.send({ message: "Error", status: 401 });
  }
});

module.exports = router;
