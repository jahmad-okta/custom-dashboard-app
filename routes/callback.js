const express = require("express");
const router = express.Router();

router.get("/", (req, res) =>
  res.oidc.callback({
    redirectUri: `${process.env.BASE_URL}callback`,
  })
);

router.post("/", express.urlencoded({ extended: false }), (req, res) => {
  res.oidc.callback({
    redirectUri: `${process.env.BASE_URL}callback`,
  });
});

module.exports = router;
