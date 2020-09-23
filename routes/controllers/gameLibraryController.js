const fs = require("fs");
const Axios = require("axios");
const express = require("express");
const checkLogin = require("../../config/checkLoginMiddleware");

const router = express.Router();

const User = require("../../models/user");
const Game = require("../../models/game");
const UserGame = require("../../models/userGame");

// convert playtime from minutes to hours:minutes
function convertMinutesToHHMM(item) {
  const totalMinutes = item.playtime_forever;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  if (hours === 0) {
    item.total_time_played = `${minutes} minutes`;
  } else {
    item.total_time_played = `${hours} hours and ${minutes} minutes`;
  }
}

router.get("/game-library", checkLogin, function (req, res) {
  // console.log(req.user);
  const userInfo = req.user;

  const files = fs.readdirSync("public/images/hero/game-library");
  const randomImage = files[Math.floor(Math.random() * files.length)];

  // get user info from DB if this isn't the user's first time visiting this page after loading
  if (req.user.first_load === false) {
    function getUserGamesOwned(userId) {
      return UserGame.query()
        .select("*")
        .from("user_games")
        .leftJoin("games", "user_games.game_id", "games.id")
        .where("user_games.user_id", "=", userId)
        .then((userGameData) => {
          return userGameData;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    getUserGamesOwned(req.user.id)
      .then((userGameData) => {
        userGameData.sort(function (a, b) {
          return (
            parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
          );
        });

        userGameData.forEach((game) => {
          if (game.potion_break_active === "true") {
            game.potion_break_active = "disabled";
          } else if (game.potion_break_active === "false") {
            game.potion_break_active = null;
          }
          convertMinutesToHHMM(game);
        });

        res.render("game-library", {
          user: req.user,
          userSteamData: userGameData,
          image: randomImage,
        });
      })
      .catch((err) => {
        console.error(err.message);
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
        // 'appids_filter[0]': 570,
        // 'appids_filter[1]': 730
      },
    })
      .then((response) => {
        const ownedGames = response.data.response;
        const timestampNow = new Date().getTime();

        // descending order in playtime
        ownedGames.games.sort(function (a, b) {
          return (
            parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
          );
        });

        // remove games with no playtime
        const playedGames = ownedGames.games.filter(function (game) {
          return game.playtime_forever > 0;
        });

        playedGames.forEach(convertMinutesToHHMM);

        // get some additional player stats
        // get total games owned
        userInfo.total_games_owned = response.data.response.game_count;

        // get total games played
        userInfo.total_games_played = Object.keys(playedGames).length;

        let totalMinutesPlayed = 0;

        // get total minutes played
        playedGames.forEach(function (item) {
          totalMinutesPlayed += item.playtime_forever;
        });
        userInfo.total_minutes_played = totalMinutesPlayed;
        userInfo.total_time_played = `${Math.floor(
          totalMinutesPlayed / 60
        )} hours and ${
          totalMinutesPlayed - Math.floor(totalMinutesPlayed / 60) * 60
        } minutes`;

        function updateUser(userId) {
          return User.query()
            .findOne("id", "=", userId)
            .patch({
              total_steam_games_owned: userInfo.total_steam_games_owned,
              total_steam_games_played: userInfo.total_steam_games_played,
            })
            .then((user) => {
              return `Successfully updated User ID: ${user}`;
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function getGame(gameId) {
          return Game.query()
            .findById(gameId)
            .withGraphFetched("screenshots")
            .withGraphFetched("movies")
            .then((game) => {
              return game;
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function insertGame(game) {
          return Game.query()
            .insert({
              id: game.appid,
              name: game.name,
              img_icon: game.img_icon_url,
              img_logo: game.img_logo_url,
              last_updated: timestampNow,
            })
            .then(() => {
              return "Sucessfully inserted game.";
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function updateGame(game) {
          return Game.query()
            .findById(game.appid)
            .patch({
              name: game.name,
              img_icon: game.img_icon_url,
              img_logo: game.img_logo_url,
            })
            .then(() => {
              return "Successfully updated game.";
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function getUserGame(userId, gameId) {
          return UserGame.query()
            .findById([userId, gameId])
            .then((userGame) => {
              return userGame;
            });
        }

        function insertUserGame(userId, game) {
          return UserGame.query()
            .insert({
              user_id: userId,
              game_id: game.appid,
              playtime_forever: game.playtime_forever,
            })
            .then(() => {
              return "Successfully inserted User Game";
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function updateUserGame(userId, game) {
          return UserGame.query()
            .findById([userId, game.appid])
            .patch({
              playtime_forever: game.playtime_forever,
            })
            .then(() => {
              return "Successfully updated game";
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        // update user's total games owned/played
        return updateUser(req.user.id)
          .then(() => {
            return Promise.all(
              playedGames.map((game) => {
                return getGame(game.appid)
                  .then((response) => {
                    // check if the games in playedGames exist in the games table
                    if (response === undefined) {
                      // if they don't add them
                      return insertGame(game);
                    }
                    // if they do, update them
                    return updateGame(game);
                  })
                  .catch((err) => {
                    console.error(err.message);
                  });
              })
            );
          })
          .then(() => {
            return Promise.all(
              playedGames.map((game) => {
                return getUserGame(req.user.id, game.appid)
                  .then((response) => {
                    // check if the games in playedGames exist in the user_games_owned table
                    if (response === undefined) {
                      // if they don't add them
                      return insertUserGame(req.user.id, game);
                    }
                    // if they do, update them
                    return updateUserGame(req.user.id, game);
                  })
                  .catch((err) => {
                    console.error(err.message);
                  });
              })
            );
          })
          .then((response) => {
            return response;
          });
      })
      .then(() => {
        function getUserGamesOwned(userId) {
          return UserGame.query()
            .select("*")
            .from("user_games")
            .leftJoin("games", "user_games.game_id", "games.id")
            .where("user_games.user_id", "=", userId)
            .then((userGameData) => {
              return userGameData;
            })
            .catch((err) => {
              console.error(err);
            });
        }

        getUserGamesOwned(req.user.id)
          .then((userGameData) => {
            userGameData.sort(function (a, b) {
              return (
                parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
              );
            });

            userGameData.forEach((game) => {
              if (game.potion_break_active === "true") {
                game.potion_break_active = "disabled";
              } else if (game.potion_break_active === "false") {
                game.potion_break_active = null;
              }
              convertMinutesToHHMM(game);
            });

            res.render("game-library", {
              user: req.user,
              userSteamData: userGameData,
              image: randomImage,
            });
          })
          .catch((err) => {
            console.error(err.message);
          });
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
});

// export routes up to routes.js
module.exports = router;
