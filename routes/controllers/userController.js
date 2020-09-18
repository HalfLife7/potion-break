var checkLogin = require('../../config/checkLoginMiddleware');
var express = require('express');
var router = express.Router();
var checkLogin = require('../../config/checkLoginMiddleware.js');
var fs = require('fs');
var Promise = require('bluebird');
const AppDAO = require('../../db/dao.js');
const { join, resolve, reject } = require('bluebird');
const dao = new AppDAO('./database.db');

// middleware to check if logged in
router.get('/user-profile', checkLogin, function (req, res) {
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
  let dbGetUser = dao.get(sql, params);

  var sql = `
    SELECT COUNT (app_id) AS total_games_played, 
    SUM(playtime_forever) AS total_minutes_played 
    FROM user_games_owned 
    WHERE user_id = ?
    `;
  var params = [req.user.user_id];
  let dbGetUserPlayTime = dao.get(sql, params);

  join(dbGetUser, dbGetUserPlayTime, function (userData, userPlayData) {
    console.log(userData);
    console.log(userPlayData);

    userData.total_minutes_played = userPlayData.total_minutes_played;
    userData.total_games_played = userPlayData.total_games_played;

    let hours = Math.floor(userData.total_minutes_played / 60);
    let minutes = userData.total_minutes_played - hours * 60;
    if (hours === 0) {
      userData.total_time_played = minutes + ' minutes';
    } else {
      userData.total_time_played = hours + ' hours and ' + minutes + ' minutes';
    }

    let fs = require('fs');
    let files = fs.readdirSync('public/images/hero/user-profile');
    let randomImage = files[Math.floor(Math.random() * files.length)];
    console.log(randomImage);

    console.log(userData);
    res.render('user-profile', {
      user: userData,
      image: randomImage,
    });
  }).catch((err) => {
    console.error('Error: ' + err);
  });
});

router.post('/update-user-profile', function (req, res) {
  let formData = req.body;
  console.log(formData);

  var sql = `
    UPDATE users SET 
        name = ?,
        email = ? 
    WHERE user_id = ?
    `;
  var params = [formData.name, formData.email, req.user.user_id];
  let dbUpdateUser = dao
    .run(sql, params)
    .then(() => {
      res.redirect('/user-profile');
    })
    .catch((err) => {
      console.error('Error: ' + err);
    });
});
// export routes up to routes.js
module.exports = router;
