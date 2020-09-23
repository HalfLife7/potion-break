const express = require("express");
var checkLogin = require("../../config/checkLoginMiddleware");

const router = express.Router();
var checkLogin = require("../../config/checkLoginMiddleware.js");
const fs = require("fs");

// middleware to check if logged in
router.get("/user-profile", checkLogin, function (req, res) {
  var sql = `
    SELECT 
        users.user_id, 
        users.steam_persona_name, 
        users.steam_profile_url, 
        users.steam_id, 
        users.steam_avatar, 
        users.total_steam_games_owned, 
        users.name, 
        users.email 
    FROM users 
    WHERE user_id = ?
    `;
  var params = [req.user.user_id];
  const dbGetUser = dao.get(sql, params);

  var sql = `
    SELECT COUNT (app_id) AS total_games_played, 
    SUM(playtime_forever) AS total_minutes_played 
    FROM user_games_owned 
    WHERE user_id = ?
    `;
  var params = [req.user.user_id];
  const dbGetUserPlayTime = dao.get(sql, params);

  join(dbGetUser, dbGetUserPlayTime, function (userData, userPlayData) {
    console.log(userData);
    console.log(userPlayData);

    userData.total_minutes_played = userPlayData.total_minutes_played;
    userData.total_games_played = userPlayData.total_games_played;

    const hours = Math.floor(userData.total_minutes_played / 60);
    const minutes = userData.total_minutes_played - hours * 60;
    if (hours === 0) {
      userData.total_time_played = `${minutes  } minutes`;
    } else {
      userData.total_time_played = `${hours  } hours and ${  minutes  } minutes`;
    }

    const fs = require("fs");
    const files = fs.readdirSync("public/images/hero/user-profile");
    const randomImage = files[Math.floor(Math.random() * files.length)];
    console.log(randomImage);

    console.log(userData);
    res.render("user-profile", {
      user: userData,
      image: randomImage,
    });
  }).catch((err) => {
    console.error(`Error: ${  err}`);
  });
});

router.post("/update-user-profile", function (req, res) {
  const formData = req.body;
  console.log(formData);

  const sql = `
    UPDATE users SET 
        name = ?,
        email = ? 
    WHERE user_id = ?
    `;
  const params = [formData.name, formData.email, req.user.user_id];
  const dbUpdateUser = dao
    .run(sql, params)
    .then(() => {
      res.redirect("/user-profile");
    })
    .catch((err) => {
      console.error(`Error: ${  err}`);
    });
});
// export routes up to routes.js
module.exports = router;
