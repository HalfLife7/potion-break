var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");

const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

// TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)

// stripe setup
var stripe = require("stripe")(config.STRIPE_SK_TEST);
var accountSid = config.STRIPE_ACCOUNT_SID;
var authToken = config.STRIPE_AUTH_TOKEN;

router.get('/potion-break/create/:appid', function (req, res) {
    const appId = req.params.appid;
    db.get("SELECT * FROM games WHERE app_id = (?)", [appId], function callback(err, row) {
        if (err != null) {
            console.err(err);
        } else {
            let gameInformation = row;
            db.all("SELECT * FROM charities", function callback(err, rows) {
                if (err != null) {
                    console.error(err);
                } else {
                    let charitiesInformation = rows;
                    res.render('create-potion-break', {
                        user: req.user,
                        game: gameInformation,
                        charities: charitiesInformation
                    })
                }
            })
        }
    })
})

router.post('/submit-potion-break', function (req, res) {
    // save user information in session and redirect to checkout
    req.user.potionBreakDetails = req.body;
    console.log(req.user);
    res.redirect('/potion-break/checkout');
})

router.get('/potion-break/checkout', function (req, res) {
    res.render('checkout');
})


// export routes up to routes.js
module.exports = router;