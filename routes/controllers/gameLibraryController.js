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

router.get("/game-library", checkLogin, async (req, res) => {
  try {
    // console.log(req.user);
    const userInfo = req.user;

    const files = fs.readdirSync("public/images/hero/game-library");
    const randomImage = files[Math.floor(Math.random() * files.length)];

    // get user info from DB if this isn't the user's first time visiting this page after loading
    if (req.user.first_load === false) {
      const userGameData = await UserGame.query()
        .select("*")
        .from("user_games")
        .leftJoin("games", "user_games.game_id", "games.id")
        .where("user_games.user_id", "=", req.user.id);

      userGameData.sort(function (a, b) {
        return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
      });

      for (const game of userGameData) {
        if (game.potion_break_active === "true") {
          game.potion_break_active = "disabled";
        } else if (game.potion_break_active === "false") {
          game.potion_break_active = null;
        }
        convertMinutesToHHMM(game);
      }

      res.render("game-library", {
        user: req.user,
        userSteamData: userGameData,
        image: randomImage,
      });
    } else {
      // if this is the user's first time visiting this page after logging in, query Steam API for updated data
      // axios get request to API to get game information

      const ownedGames = await Axios({
        method: "get",
        url: "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
        params: {
          steamid: userInfo.steam_id,
          key: process.env.STEAM_API_KEY,
          include_played_free_games: true,
          include_appinfo: true,
          format: "json",
          // 'appids_filter[0]': 570,
          // 'appids_filter[1]': 730
        },
      }).then((response) => {
        return response.data.response;
      });

      const timestampNow = new Date().getTime();

      // descending order in playtime
      ownedGames.games.sort(function (a, b) {
        return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
      });

      // remove games with no playtime
      const playedGames = ownedGames.games.filter(function (game) {
        return game.playtime_forever > 0;
      });

      for (const game of playedGames) {
        convertMinutesToHHMM(game);
      }

      // get some additional player stats
      // get total games owned
      userInfo.total_steam_games_owned = ownedGames.game_count;

      // get total games played
      userInfo.total_steam_games_played = Object.keys(playedGames).length;

      let totalMinutesPlayed = 0;

      // get total minutes played
      for (const game of playedGames) {
        totalMinutesPlayed += game.playtime_forever;
      }
      // playedGames.forEach(function (item) {
      //   totalMinutesPlayed += item.playtime_forever;
      // });
      userInfo.total_minutes_played = totalMinutesPlayed;
      userInfo.total_time_played = `${Math.floor(
        totalMinutesPlayed / 60
      )} hours and ${
        totalMinutesPlayed - Math.floor(totalMinutesPlayed / 60) * 60
      } minutes`;

      const updateUser = await User.query()
        .findOne("id", "=", req.user.id)
        .patch({
          total_steam_games_owned: userInfo.total_steam_games_owned,
          total_steam_games_played: userInfo.total_steam_games_played,
        });

      for (const game of playedGames) {
        const getGame = await Game.query()
          .findById(game.appid)
          .withGraphFetched("screenshots")
          .withGraphFetched("movies");
        // check if the games in playedGames exist in the games table
        if (getGame === undefined) {
          // if they don't add them
          const insertGame = await Game.query().insert({
            id: game.appid,
            name: game.name,
            img_icon: game.img_icon_url,
            img_logo: game.img_logo_url,
            last_updated: timestampNow,
          });
        } else {
          // if they do, update them
          const updateGame = await Game.query().findById(game.appid).patch({
            name: game.name,
            img_icon: game.img_icon_url,
            img_logo: game.img_logo_url,
          });
        }
      }

      // playedGames.forEach(async (game) => {
      //   const getGame = await Game.query()
      //     .findById(game.appid)
      //     .withGraphFetched("screenshots")
      //     .withGraphFetched("movies");
      //   // check if the games in playedGames exist in the games table
      //   if (getGame === undefined) {
      //     // if they don't add them
      //     const insertGame = await Game.query().insert({
      //       id: game.appid,
      //       name: game.name,
      //       img_icon: game.img_icon_url,
      //       img_logo: game.img_logo_url,
      //       last_updated: timestampNow,
      //     });
      //   } else {
      //     // if they do, update them
      //     const updateGame = await Game.query().findById(game.appid).patch({
      //       name: game.name,
      //       img_icon: game.img_icon_url,
      //       img_logo: game.img_logo_url,
      //     });
      //   }
      // });

      for (const game of playedGames) {
        const getUserGame = await UserGame.query().findById([
          req.user.id,
          game.appid,
        ]);

        // check if the games in playedGames exist in the user_games_owned table
        if (getUserGame === undefined) {
          // if they don't, add them
          const insertUserGame = await UserGame.query().insert({
            user_id: req.user.id,
            game_id: game.appid,
            playtime_forever: game.playtime_forever,
          });
        } else {
          const updateUserGame = await UserGame.query()
            .findById([req.user.id, game.appid])
            .patch({
              playtime_forever: game.playtime_forever,
            });
        }
      }

      // playedGames.forEach(async (game) => {
      //   const getUserGame = await UserGame.query().findById([
      //     req.user.id,
      //     game.appid,
      //   ]);

      //   // check if the games in playedGames exist in the user_games_owned table
      //   if (getUserGame === undefined) {
      //     // if they don't, add them
      //     const insertUserGame = await UserGame.query().insert({
      //       user_id: req.user.id,
      //       game_id: game.appid,
      //       playtime_forever: game.playtime_forever,
      //     });
      //   } else {
      //     const updateUserGame = await UserGame.query()
      //       .findById([req.user.id, game.appid])
      //       .patch({
      //         playtime_forever: game.playtime_forever,
      //       });
      //   }
      // });

      const userGameData = await UserGame.query()
        .select("*")
        .from("user_games")
        .leftJoin("games", "user_games.game_id", "games.id")
        .where("user_games.user_id", "=", req.user.id);

      userGameData.sort(function (a, b) {
        return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
      });

      for (const game of userGameData) {
        if (game.potion_break_active === "true") {
          game.potion_break_active = "disabled";
        } else if (game.potion_break_active === "false") {
          game.potion_break_active = null;
        }
        convertMinutesToHHMM(game);
      }

      // userGameData.forEach((game) => {
      //   if (game.potion_break_active === "true") {
      //     game.potion_break_active = "disabled";
      //   } else if (game.potion_break_active === "false") {
      //     game.potion_break_active = null;
      //   }
      //   convertMinutesToHHMM(game);
      // });

      res.render("game-library", {
        user: req.user,
        userSteamData: userGameData,
        image: randomImage,
      });
    }
  } catch (err) {
    console.error(err.message);
  }
});

// export routes up to routes.js
module.exports = router;
