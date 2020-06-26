var express = require("express");
var router = express.Router();
var passport = require("passport");

router.route('/login')
    .post(function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                console.log("err");
                return next(err); // will generate a 500 error
            }
            if (!user) {
                console.log("no user");
                return res.status(400).render('pages/login', {
                    errMsg: info.errMsg
                });
            }
            req.login(user, function (err) {
                console.log("success");
                if (err) {
                    console.error(err);
                    return next(err);
                }
                return res.status(302).redirect('/dashboard');
            });
        })(req, res, next);
    });

// export routes up to routes.js
module.exports = router;