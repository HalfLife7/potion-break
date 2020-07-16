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

// // testing moment.js
// var moment = require('moment'); // require

// var formDate = moment("2020-07-23");
// console.log("formDate: " + formDate);
// console.log(formDate.toDate());

// var test = moment("2020-07-23").format("dddd, MMMM Do YYYY");
// console.log("QUICK: " + test);

// var unixStartDate = moment.unix(1594583528)
// console.log("unixStartDate: " + unixStartDate);
// console.log(unixStartDate.toDate());

// var test1 = moment.unix(1594583528).format("dddd, MMMM Do YYYY")
// console.log("QUICK: " + test1);

// var start_date = 1594616648;
// var end_date = 1597291200;

// var formatted_start_date = moment.unix(start_date).format("dddd, MMMM Do YYYY");
// var formatted_end_date = moment.unix(end_date).format("dddd, MMMM Do YYYY");

// console.log(formatted_start_date);
// console.log(formatted_end_date);

// var formatted_start_date1 = moment.unix(start_date);
// var formatted_end_date1 = moment.unix(end_date);

// var total_days = formatted_end_date1.diff(formatted_start_date1, 'days');
// console.log(total_days);
// stripe.paymentMethods.list({
//         customer: 'cus_HcNWg5HB5W5bfO',
//         type: 'card'
//     },
//     function (err, paymentMethods) {
//         console.log(paymentMethods);
//     }
// );



// export routes up to routes.js
module.exports = router;