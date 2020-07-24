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
        db.all("SELECT * FROM games WHERE app_id in (?,?,?)", ["570", "546560", "435150"], function (err, rows) {
            if (err) {
                console.error(err);
            } else {
                console.log(rows);
                let dota = rows[0];
                let divinity = rows[1];
                let halflife = rows[2];

                db.all("SELECT * FROM charities", [], function (err, rows) {
                    if (err) {
                        console.error(err);
                    } else {
                        let charityData = rows;
                        console.log(charityData);
                        res.render("home", {
                            dotaData: dota,
                            halflifeData: halflife,
                            divinityData: divinity,
                            charityData: charityData
                        });
                    }
                })


            }
        })
    }
});

router.get("/login", checkLogin, function (req, res) {
    res.render("login");
});

// export routes up to routes.js
module.exports = router;