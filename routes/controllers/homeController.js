var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");
var checkLogin = require("../../config/checkLoginMiddleware.js");

// middleware to check if logged in

router.get("/", function (req, res) {
    if (req.user) {
        res.redirect("/user");
    } else {
        res.render("home");
    }
});

router.get("/login", checkLogin, function (req, res) {
    res.render("login");
});

// export routes up to routes.js
module.exports = router;