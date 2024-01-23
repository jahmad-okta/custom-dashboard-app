const express = require('express');
const app = require('../server');
const router = express.Router()

// define the home page route
router.get("/", async (req, res) => {
    try {
        if(req.oidc.isAuthenticated() && !req.oidc.accessToken.isExpired()){
            const userInfo = await req.oidc.fetchUserInfo()
            if(process.env.DEBUG === true){
                console.log(userInfo);
            }
            res.render('pages/index', {
                "hasSession": true,
                "title": "Index",
                "accessToken": req.oidc.accessToken.access_token,
                "idToken": req.oidc.idToken,
                "userInfo": userInfo
            })
        }
        else{
            res.render('pages/index', {
                "title": "Index",
                "hasSession": false
            });
        }
    }
    catch (e) {
        console.error(e);
        res.send(e);
    }
})

module.exports = router