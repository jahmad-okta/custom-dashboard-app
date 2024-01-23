const express = require("express");
var bodyParser = require("body-parser");
require("dotenv").config();
const { join } = require("path");
const {
  auth,
  attemptSilentLogin,
  requiresAuth,
} = require("express-openid-connect");
const app = express();
var axios = require("axios");

//Import Routes
var index = require("./routes/index");
var login = require("./routes/login");
// var callback = require("./routes/callback");
var api = require("./routes/api");
var profile = require("./routes/profile");
var updateProfile = require("./routes/api/updateProfile");
var accountLinking = require("./routes/account-linking");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "public")));

//Auth Config
const config = {
  routes: { login: false },
  authorizationParams: {
    response_type: "code id_token",
    scope: "openid email profile address offline_access",
  },
  issuerBaseURL: `https://${process.env.AUTH0_ISSUER_DOMAIN}`,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.SECRET,
  authRequired: false,
  attemptSilentLogin: true,
  auth0Logout: true,
};

app.use(auth(config));

//Add Routes
app.use("/", index);
app.use("/api-request", api);
app.use("/login", login);
// app.use("/callback", callback);
app.use("/profile", profile);
app.use("/account-linking", accountLinking);

//API Routes
app.use("/api/updateProfile", updateProfile);

process.on("SIGINT", function () {
  process.exit();
});

module.exports = app;
