var express = require("express");
var router = express.Router();
var db = require("../../config/db.js");
var checkLogin = require("../../config/checkLoginMiddleware.js");
var fs = require('fs');

// middleware to check if logged in
router.get("/user-profile", function (req, res) {
    db.serialize(function () {
        db.get("SELECT users.user_id, users.steam_persona_name, users.steam_profile_url, users.steam_id, users.steam_avatar, users.total_steam_games_owned, users.name, users.email FROM users WHERE user_id = ?", [req.user.user_id], function (err, row) {
            // db.get("SELECT * FROM users INNER JOIN user_games_owned ON users.user_id = user_games_owned.user_id WHERE user_id = ?", [req.user.user_id], function (err, row) {
            if (err) {
                console.error(err)
            } else {
                let userData = row;
                console.log(userData);
                db.get("SELECT COUNT(app_id) AS total_games_played, SUM(playtime_forever) AS total_minutes_played FROM user_games_owned WHERE user_id = ?", [req.user.user_id], function (err, row) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(row);
                        userData.total_minutes_played = row.total_minutes_played;
                        userData.total_games_played = row.total_games_played;

                        var hours = Math.floor(userData.total_minutes_played / 60)
                        var minutes = userData.total_minutes_played - (hours * 60)
                        if (hours === 0) {
                            userData.total_time_played = minutes + " minutes"
                        } else {
                            userData.total_time_played = hours + " hours and " + minutes + " minutes";
                        }

                        var fs = require('fs');
                        var files = fs.readdirSync('public/images/hero/user-profile')
                        /* now files is an Array of the name of the files in the folder and you can pick a random name inside of that array */
                        let randomImage = files[Math.floor(Math.random() * files.length)]
                        console.log(randomImage);

                        console.log(userData);
                        res.render("user-profile", {
                            user: userData,
                            image: randomImage
                        });
                    }
                })
            }
        })
    })
});

router.post('/update-user-profile', function (req, res) {
    let formData = req.body;
    console.log(formData);
    db.serialize(function () {
        db.run("UPDATE users SET name = ?, email = ? WHERE user_id = ?", [formData.name, formData.email, req.user.user_id], function (err) {
            if (err) {
                console.error(err);
            } else {
                res.redirect('/user-profile')
            }
        })
    })
})
// export routes up to routes.js
module.exports = router;