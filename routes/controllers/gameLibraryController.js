var checkLogin = require("../../config/checkLoginMiddleware");
var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
const Axios = require("axios");
const response = require("express");
var fs = require("fs");

// convert playtime from minutes to hours:minutes
function convertMinutesToHHMM(item, index) {
  let totalMinutes = item.playtime_forever;
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes - hours * 60;
  if (hours === 0) {
    item.total_time_played = minutes + " minutes";
  } else {
    item.total_time_played = hours + " hours and " + minutes + " minutes";
  }
}

router.get("/game-library", checkLogin, function (req, res) {
  console.log(req.user);
  let userInfo = req.user;

  let files = fs.readdirSync("public/images/hero/game-library");
  let randomImage = files[Math.floor(Math.random() * files.length)];

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
      `;
    var params = [userInfo.user_id];

    dao.all(sql, params).then((userGameData) => {
      // descending order in playtime
      userGameData.sort(function (a, b) {
        return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
      });

      userGameData.map((game) => {
        if (game.potion_break_active === "true") {
          game.potion_break_active = "disabled";
        } else if (game.potion_break_active === "false") {
          game.potion_break_active = null;
        }
        convertMinutesToHHMM(game);
      });

      console.log(userGameData);
      console.log(req.user);

      res.render("game-library", {
        user: req.user,
        userSteamData: userGameData,
        image: randomImage,
      });
    });
  } else {
    // if this is the user's first time visiting this page after logging in, query Steam API for updated data
    // axios get request to API to get game information
    Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
      params: {
        steamid: userInfo.steam_id,
        key: process.env.STEAM_API_KEY,
        include_played_free_games: true,
        include_appinfo: true,
        format: "json",
        //'appids_filter[0]': 570,
        //'appids_filter[1]': 730
      },
    })
      .then((response) => {
        let ownedGames = response.data.response;

        // // change appid to app_id
        // ownedGames.games.forEach(function (gameData, index, array) {
        //   gameData.app_id = gameData.appid;
        //   delete gameData.appid;
        // });

        // descending order in playtime
        ownedGames.games.sort(function (a, b) {
          return (
            parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
          );
        });

        // remove games with no playtime
        let playedGames = ownedGames.games.filter(function (game) {
          return game.playtime_forever > 0;
        });

        playedGames.forEach(convertMinutesToHHMM);

        // get some additional player stats
        // get total games owned
        userInfo.total_games_owned = response.data.response.game_count;

        // get total games played
        userInfo.total_games_played = Object.keys(playedGames).length;

        let total_minutes_played = 0;

        // get total minutes played
        playedGames.forEach(function (item, index) {
          total_minutes_played += item.playtime_forever;
        });
        userInfo.total_minutes_played = total_minutes_played;
        userInfo.total_time_played =
          Math.floor(total_minutes_played / 60) +
          " hours and " +
          (total_minutes_played - Math.floor(total_minutes_played / 60) * 60) +
          " minutes";

        function updateUser() {
          return Axios({
            method: "PUT",
            url: `http://localhost:5000/db/users/update/total-games`,
            data: {
              total_steam_games_owned: userInfo.total_games_owned,
              total_steam_games_played: userInfo.total_games_played,
              user_id: userInfo.user_id,
            },
          });
        }

        function getGame(id) {
          return Axios({
            method: "GET",
            url: `http://localhost:5000/db/games/${id}`,
          });
        }

        function insertGame(game) {
          return Axios({
            method: "POST",
            url: `http://localhost:5000/db/games`,
            data: {
              app_id: game.appid,
              name: game.name,
              img_icon_url: game.img_icon_url,
              img_logo_url: game.img_logo_url,
            },
          });
        }

        function updateGame(game) {
          return Axios({
            method: "PUT",
            url: `http://localhost:5000/db/games/${game.id}`,
            data: {
              name: game.name,
              img_icon_url: game.img_icon_url,
              img_logo_url: game.img_logo_url,
            },
          });
        }

        function getUserGame(userId, gameId) {
          return Axios({
            method: "GET",
            url: `http://localhost:5000/db/user-games/?userId=${userId}&gameId=${gameId}`,
          });
        }

        function insertUserGame() {
          return Axios({
            method: "POST",
            url: `http://localhost:5000/db/user-games/insert`,
            data: {
              user_id: req.user.user_id,
              game_id: game.appid,
              playtime_forever: game.playtime_forever,
            },
          });
        }

        function updateUserGame() {
          return Axios({
            method: "PUT",
            url: `http://localhost:5000/db/user-games/update?userId=${userId}&gameId=${gameId}`,
            data: {
              playtime_forever: game.playtime_forever,
            },
          });
        }

        // update user's total games owned/played

        // check if the games in playedGames exist in the games table
        // if they don't add them
        // if they do, update them

        // check if the games in playedGames exist in the user_games_owned table
        // if they don't add them
        // if they do, update them

        //OLD SQLITE
        // var sql = `
        // UPDATE users
        // SET total_steam_games_owned = ?
        // WHERE user_id = ?
        // `;

        // var params = [userInfo.total_games_owned, userInfo.user_id];
        // let dbUpdateUserTotalGamesPlayed = dao.run(sql, params);

        // let dbUpsertGames = Promise.all(
        //   playedGames.map((game) => {
        //     //// let = { app_id, name, img_icon_url, img_logo_url } = game;

        //     var sql = `
        //     INSERT INTO games (
        //       app_id,
        //       name,
        //       img_icon_url,
        //       img_logo_url)
        //       VALUES(?, ?, ?, ?)
        //       ON CONFLICT(app_id) DO UPDATE SET
        //       name = excluded.name,
        //       img_icon_url = excluded.img_icon_url,
        //       img_logo_url = excluded.img_logo_url
        //     `;

        //     return dao.run(sql, [
        //       game.app_id,
        //       game.name,
        //       game.img_icon_url,
        //       game.img_logo_url,
        //     ]);
        //   })
        // );

        // let dbUpsertUserGames = Promise.all(playedGames).map((game) => {
        //   // let = { app_id, playtime_forever } = game;

        //   var sql = `
        //   INSERT INTO user_games_owned (
        //     app_id,
        //     user_id,
        //     playtime_forever)
        //     VALUES(?, ?, ?)
        //     ON CONFLICT(app_id, user_id) DO UPDATE SET
        //     playtime_forever = excluded.playtime_forever
        //   `;

        //   return dao.run(sql, [
        //     game.app_id,
        //     req.user.user_id,
        //     game.playtime_forever,
        //   ]);
        // });

        // update db from steam api query
        return join(
          dbUpdateUserTotalGamesPlayed,
          dbUpsertGames,
          dbUpsertUserGames,
          function () {}
        );
      })
      .then(() => {
        var sql = `
          SELECT 
            user_games_owned.*, 
            games.*
          FROM user_games_owned 
          INNER JOIN games 
          ON user_games_owned.app_id = games.app_id 
          WHERE user_id = ?
          `;
        var params = [userInfo.user_id];

        dao.all(sql, params).then((userGameData) => {
          // descending order in playtime
          userGameData.sort(function (a, b) {
            return (
              parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
            );
          });

          userGameData.map((game) => {
            if (game.potion_break_active === "true") {
              game.potion_break_active = "disabled";
            } else if (game.potion_break_active === "false") {
              game.potion_break_active = null;
            }
            convertMinutesToHHMM(game);
          });

          console.log(userGameData);
          console.log(req.user);

          res.render("game-library", {
            user: req.user,
            userSteamData: userGameData,
            image: randomImage,
          });
        });
      })
      .catch((err) => {
        console.error("Error: " + err);
      });
  }
});

// export routes up to routes.js
module.exports = router;
