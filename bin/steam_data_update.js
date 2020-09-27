#!/usr/bin/env node

var format = require("date-fns/format");
const Axios = require("axios");
const Bottleneck = require("bottleneck/es5");

const Game = require("../../../models/game");
const GameScreenshot = require("../../../models/gameScreenshot");
const GameMovie = require("../../../models/gameMovie.js");

async function steamDataUpdate() {
  try {
    // cron job to update steam game screenshots, movies, etc.
    // get all games in db
    const gamesData = await Game.query().select("id", "name");

    // use bottleneck's limiter to throttle api calls to 1/sec (1000ms)
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 1000,
    });

    const steamGameData = await Promise.all(
      gamesData.map(async (game) => {
        return await limiter.schedule(() => {
          return Axios.get("https://store.steampowered.com/api/appdetails", {
            params: {
              appids: game.id,
              format: "json",
            },
          }).then((response) => {
            const timeNow = format(new Date());
            console.log(`${game.name} - ${game.id} - ${timeNow}`);

            // fix for games that cannot be queried by the store.steampowered api (such as dead island - 91310)
            if (response.data[game.id].data === undefined) {
              game.steam_appid = game.id;
              return game;
            } else {
              return response.data[game.id].data;
            }
          });
        });
      })
    );

    const dateToday = format(new Date(), "yyyy-MM-dd");

    for (const game of steamGameData) {
      const updateGame = await Game.query()
        .where("id", "=", game.steam_appid)
        .patch({
          header_image: game?.header_image,
          last_updated: dateToday,
        });

      if (game?.screenshots?.length !== 0 && game.screenshots) {
        for (const screenshot of game.screenshots) {
          // check if the this screenshot is already in the db
          const checkScreenshot = await GameScreenshot.query().findById([
            game.steam_appid,
            screenshot.id,
          ]);

          // insert into db if it doesn't exist yet
          if (checkScreenshot === undefined) {
            await GameScreenshot.query().insert({
              game_id: game.steam_appid,
              id: screenshot.id,
              path_thumbnail: screenshot.path_thumbnail,
              path_full: screenshot.path_full,
            });
          } else {
            // update the existing entry if it does exist
            await GameScreenshot.query()
              .findById([game.steam_appid, screenshot.id])
              .patch({
                path_thumbnail: screenshot?.path_thumbnail,
                path_full: screenshot?.path_full,
              });
          }
        }
      }

      if (game?.movies?.length !== 0 && game.movies) {
        for (const movie of game.movies) {
          // check if the this movie is already in the db
          const checkMovie = await GameMovie.query().findById([
            game.steam_appid,
            movie.id,
          ]);

          // insert into db if it doesn't exist yet
          if (checkMovie === undefined) {
            await GameMovie.query().insert({
              game_id: game.steam_appid,
              id: movie.id,
              name: movie?.name,
              thumbnail: movie?.thumbnail,
              webm_480: movie?.webm?.["480"],
              webm_max: movie?.webm?.["max"],
              mp4_480: movie?.mp4?.["480"],
              mp4_max: movie?.mp4?.["max"],
            });
          } else {
            // update the existing entry if it does exist
            await GameMovie.query()
              .findById([game.steam_appid, movie.id])
              .patch({
                name: movie?.name,
                thumbnail: movie?.thumbnail,
                webm_480: movie?.webm?.["480"],
                webm_max: movie?.webm?.["max"],
                mp4_480: movie?.mp4?.["480"],
                mp4_max: movie?.mp4?.["max"],
              });
          }
        }
      }
    }
    process.exit();
  } catch (err) {
    console.error(err.message);
  }
}

steamDataUpdate();
