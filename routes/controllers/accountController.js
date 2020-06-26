var express = require("express");
var router = express.Router();
var passport = require("passport");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/", {
    errorMessage: "You must be logged in!"
  });
}

router.get("/account", function (req, res) {
  res.render("account");
});

// export routes up to routes.js
module.exports = router;