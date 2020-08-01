var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
const Axios = require("axios");
const response = require("express");
var fs = require('fs');
var Promise = require("bluebird");
const AppDAO = require("../../db/dao.js");
const {
  join
} = require("bluebird");
const dao = new AppDAO('./database.db');


// convert playtime from minutes to hours:minutes
function convertMinutesToHHMM(item, index) {
  totalMinutes = item.playtime_forever;
  var hours = Math.floor(totalMinutes / 60)
  var minutes = totalMinutes - (hours * 60)
  if (hours === 0) {
    item.total_time_played = minutes + " minutes"
  } else {
    item.total_time_played = hours + " hours and " + minutes + " minutes";
  }
}

router.get("/game-library", function (req, res) {
  console.log(req.user);
  let userInfo = req.user;

  var files = fs.readdirSync('public/images/hero/game-library')
  /* now files is an Array of the name of the files in the folder and you can pick a random name inside of that array */
  let randomImage = files[Math.floor(Math.random() * files.length)]

  // get user info from DB if this isn't the user's first time visiting this page after loading
  if (req.user.first_load === false) {

    var sql = `
    SELECT 
      user_games_owned.*, 
      games.*
    FROM user_games_owned 
    INNER JOIN games 
    ON user_games_owned.app_id = games.app_id 
    WHERE user_id = ?
    `
    var params = [userInfo.user_id];

    dao.all(sql, params)
      .then((userGameData) => {
        console.log(userGameData);

        // descending order in playtime
        userGameData.sort(function (a, b) {
          return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
        });

        userGameData.forEach(convertMinutesToHHMM);
        console.log(userGameData);
        console.log(req.user);

        res.render("game-library", {
          user: req.user,
          userSteamData: userGameData,
          image: randomImage
        });
      })
  } else {
    // if this is the user's first time visiting this page after logging in, query Steam API for updated data
    // axios get request to API to get game information
    console.log("HERE!");
    Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
        params: {
          steamid: userInfo.steam_id,
          key: process.env.STEAM_API_KEY,
          include_played_free_games: true,
          include_appinfo: true,
          format: 'json'
          //'appids_filter[0]': 570,
          //'appids_filter[1]': 730
        }
      }).then((response) => {
        console.log("HERE2");
        let getOwnedGamesData = response.data.response;

        // change appid to app_id
        getOwnedGamesData.games.forEach(function (gameData, index, array) {
          gameData.app_id = gameData.appid;
          delete gameData.appid;
        });

        // descending order in playtime
        getOwnedGamesData.games.sort(function (a, b) {
          return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
        });

        // remove games with no playtime
        let filteredGamesData = getOwnedGamesData.games.filter(function (game) {
          return game.playtime_forever > 0;
        });

        filteredGamesData.forEach(convertMinutesToHHMM);

        // get some additional player stats
        // get total games owned
        userInfo.total_games_owned = getOwnedGamesData.game_count;

        // get total games played
        userInfo.total_games_played = Object.keys(filteredGamesData).length;

        let total_minutes_played = 0;

        // get total minutes played
        filteredGamesData.forEach(function (item, index) {
          total_minutes_played += item.playtime_forever;
        });
        userInfo.total_minutes_played = total_minutes_played;
        userInfo.total_time_played = (Math.floor(total_minutes_played / 60) + " hours and " + (total_minutes_played - (Math.floor(total_minutes_played / 60)) * 60) + " minutes");

        var sql = `
        UPDATE users 
        SET total_steam_games_owned = ? 
        WHERE user_id = ?
        `;

        var params = [userInfo.total_games_owned, userInfo.user_id];
        let dbUpdateUserTotalGamesPlayed = dao.run(sql, params);

        let dbUpsertGames = Promise.all(filteredGamesData.map((game) => {
          let = {
            app_id,
            img_icon_url,
            img_logo_url
          } = game;

          var sql = `
            INSERT INTO games (
              app_id, 
              name, 
              img_icon_url, 
              img_logo_url) 
              VALUES(?, ?, ?, ?) 
              ON CONFLICT(app_id) DO UPDATE SET 
              name = excluded.name, 
              img_icon_url = excluded.img_icon_url, 
              img_logo_url = excluded.img_logo_url
            `;

          return dao.run(sql, [game.app_id, game.img_icon_url, game.img_logo_url]);
        }))

        let dbUpsertUserGames = Promise.all(filteredGamesData).map((game) => {
          let = {
            app_id,
            user_id,
            platime_forever
          } = game;

          var sql = `
          INSERT INTO user_games_owned (
            app_id, 
            user_id, 
            playtime_forever) 
            VALUES(?, ?, ?) 
            ON CONFLICT(app_id, user_id) DO UPDATE SET 
            playtime_forever = excluded.playtime_forever
          `;

          return dao.run(sql, [game.app_id, game.user_id, game.playtime_forever]);
        })

        join(dbUpdateUserTotalGamesPlayed, dbUpsertGames, dbUpsertUserGames,
          function () {
            // render the page
            console.log(filteredGamesData);
            console.log(userInfo);
            req.user.first_load = false;
            res.render("game-library", {
              user: userInfo,
              userSteamData: filteredGamesData,
              image: randomImage
            });
          })
      })
      .catch((err) => {
        console.error("Error: " + err);
      })
  }
})

// export routes up to routes.js
module.exports = router;