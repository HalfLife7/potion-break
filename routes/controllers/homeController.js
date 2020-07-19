var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");
var checkLogin = require("../../config/checkLoginMiddleware.js");
const stripe = require('stripe')(process.env.STRIPE_SK_TEST);

// middleware to check if logged in
router.get("/", function (req, res) {
    if (req.user) {
        res.redirect("/game-library");
    } else {
        res.render("home");
    }
});

router.get("/login", checkLogin, function (req, res) {
    res.render("login");
});

// export routes up to routes.js
module.exports = router;