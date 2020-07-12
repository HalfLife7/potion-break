var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
const Axios = require("axios");
const response = require("express");
var db = require("../../config/db.js");
var stripe = require("stripe")(config.STRIPE_SK_TEST);

// TODO: get user data from steam API only during initial login

router.get("/user", function (req, res) {
  console.log(req.user);
  userInfo = req.user;

  // axios get request to API to get game information
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
    var getOwnedGamesData = response.data.response;

    // descending order in playtime
    getOwnedGamesData.games.sort(function (a, b) {
      return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
    })

    // remove games with no playtime
    let filteredGamesData = getOwnedGamesData.games.filter(function (game) {
      return game.playtime_forever > 0;
    })

    // convert playtime from minutes to hours:minutes
    function convertMinutesToHHMM(item, index) {
      totalMinutes = item.playtime_forever;
      var hours = Math.floor(totalMinutes / 60)
      var minutes = totalMinutes - (hours * 60)
      if (hours === 0) {
        item.totalTimePlayed = minutes + " minutes"
      } else {
        item.totalTimePlayed = hours + " hours and " + minutes + " minutes";
      }

    }

    filteredGamesData.forEach(convertMinutesToHHMM);

    // get some additional player stats
    // get total games owned
    userInfo.totalGamesOwned = getOwnedGamesData.game_count;
    // get total games played
    userInfo.totalGamesPlayed = Object.keys(filteredGamesData).length;

    var totalMinutesPlayed = 0;
    // get total minutes played
    function calculateSum(item, index) {
      totalMinutesPlayed += item.playtime_forever;
    }
    filteredGamesData.forEach(calculateSum);

    userInfo.totalMinutesPlayed = totalMinutesPlayed;
    userInfo.totalTimePlayed = (Math.floor(totalMinutesPlayed / 60) + " hours and " + (totalMinutesPlayed - (Math.floor(totalMinutesPlayed / 60)) * 60) + " minutes");

    //console.log(filteredGamesData);

    // update database of games
    db.serialize(function () {
      var stmt = db.prepare("INSERT INTO games (app_id, name, img_icon_url, img_logo_url) VALUES (?,?,?,?) ON CONFLICT(app_id) DO UPDATE SET name=excluded.name, img_icon_url=excluded.img_icon_url, img_logo_url=excluded.img_logo_url", function callback(err) {
        if (err != null) {
          console.log(err);
        }
      });

      for (var i = 0; i < filteredGamesData.length; i++) {
        if (i === (filteredGamesData.length - 1)) {
          stmt.finalize();
          // run this for the last row in the data
          db.run("INSERT INTO games (app_id, name, img_icon_url, img_logo_url) VALUES (?,?,?,?) ON CONFLICT(app_id) DO UPDATE SET name=excluded.name, img_icon_url=excluded.img_icon_url, img_logo_url=excluded.img_logo_url", [filteredGamesData[i].appid, filteredGamesData[i].name, filteredGamesData[i].img_icon_url, filteredGamesData[i].img_logo_url], function callback(err) {
            if (err != null) {
              console.log(err);
            } else {
              // update user's games owned and playtime
              var stmt = db.prepare("INSERT INTO user_games_owned (app_id, user_id, total_playtime) VALUES (?,?,?) ON CONFLICT(app_id, user_id) DO UPDATE SET total_playtime=excluded.total_playtime", function callback(err) {
                if (err != null) {
                  console.log(err);
                }
              });

              for (var i = 0; i < filteredGamesData.length; i++) {
                if (i === (filteredGamesData.length - 1)) {
                  stmt.finalize();
                  // run this for the last row in the data
                  db.run("INSERT INTO user_games_owned (app_id, user_id, total_playtime) VALUES (?,?,?) ON CONFLICT(app_id, user_id) DO UPDATE SET total_playtime=excluded.total_playtime", [filteredGamesData[i].appid, userInfo.user_id, filteredGamesData[i].playtime_forever], function callback(err) {
                    if (err != null) {
                      console.log(err);
                    } else {
                      // render the page
                      res.render("user", {
                        user: userInfo,
                        userSteamData: filteredGamesData
                      });
                    }
                  });
                } else {
                  stmt.run(filteredGamesData[i].appid, userInfo.user_id, filteredGamesData[i].playtime_forever);
                }
              }

            }
          });
        } else {
          stmt.run(filteredGamesData[i].appid, filteredGamesData[i].name, filteredGamesData[i].img_icon_url, filteredGamesData[i].img_logo_url);
        }
      }
    })
  }, (error) => {
    console.log(error);
  })
})

// export routes up to routes.js
module.exports = router;