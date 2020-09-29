const express = require("express");
var format = require("date-fns/format");

const router = express.Router();
const Axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SK_TEST);
const { CronJob } = require("cron");

const Bottleneck = require("bottleneck/es5");

const PotionBreak = require("../../../models/potionBreak");
const UserGame = require("../../../models/userGame");
const Game = require("../../../models/game");
const GameScreenshot = require("../../../models/gameScreenshot");
const GameMovie = require("../../../models/gameMovie.js");

//  0 0 * * * - at midnight every night
// 1-59/2 * * * * - odd minute for testing
const potionBreakDailyCheck = new CronJob("1-59/2 * * * *", async () => {
  try {
    // get users who have potion break ending that night
    const dateToday = format(new Date(), "yyyy-MM-dd");

    const potionBreakData = await PotionBreak.query()
      .select("potion_breaks.*")
      .from("potion_breaks")
      .where("potion_breaks.end_date", "=", dateToday)
      .where("potion_breaks.status", "=", "Ongoing")
      .join("users", "potion_breaks.user_id", "users.id")
      .select("users.steam_id", "users.stripe_customer_id");

    let userGameData = await Promise.all(
      potionBreakData.map(async (potionBreak) => {
        return await Axios.get(
          "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
          {
            params: {
              steamid: potionBreak.steam_id,
              key: process.env.STEAM_API_KEY,
              include_played_free_games: true,
              include_appinfo: true,
              format: "json",
              "appids_filter[0]": potionBreak.game_id,
            },
          }
        ).then((response) => {
          return response.data.response.games[0];
        });
      })
    );

    // https://thecodebarbarian.com/for-vs-for-each-vs-for-in-vs-for-of-in-javascript
    for (const [i, potionBreak] of potionBreakData.entries()) {
      const userPreviousPlaytime = potionBreak.playtime_start;
      const userCurrentPlaytime = userGameData[i].playtime_forever;

      // if user played (increase playtime) -> fail potion break
      if (userPreviousPlaytime < userCurrentPlaytime) {
        // update user game data
        const updatePotionBreakFailure = await PotionBreak.query()
          .where("id", "=", potionBreak.id)
          .patch({
            status: "Failure",
            playtime_end: userCurrentPlaytime,
            payment_status: "Unpaid",
          });
      } else {
        // if user hasn't played (same playtime) -> succeed potion break
        const updatePotionBreakSuccess = await PotionBreak.query()
          .where("id", "=", potionBreak.id)
          .patch({
            status: "Success",
            playtime_end: userCurrentPlaytime,
            payment_status: "N/A",
          });
      }

      // update user games owned status for each potion break
      const updateUserGame = await UserGame.query()
        .where("game_id", "=", potionBreak.game_id)
        .where("user_id", "=", potionBreak.user_id)
        .patch({
          potion_break_active: "false",
        });
    }

    // get successful potion breaks
    const successfulPotionBreaks = await PotionBreak.query()
      .select("potion_breaks.*")
      .from("potion_breaks")
      .where("potion_breaks.end_date", "=", dateToday)
      .where("potion_breaks.status", "=", "Success")
      .join("users", "potion_breaks.user_id", "users.id")
      .select("users.steam_id", "users.stripe_customer_id");

    // get setup intents from stripe
    const setupIntents = await Promise.all(
      successfulPotionBreaks.map(async (potionBreak) => {
        return await stripe.setupIntents.retrieve(potionBreak.setup_intent_id);
      })
    );

    // remove the payment methods tied to the setupIntents
    // no longer need to charge them since the potion break was successful
    for (const setupIntent of setupIntents) {
      await stripe.paymentMethods.detach(setupIntent.payment_method);
    }
  } catch (err) {
    console.error(err.message);
  }
});

// 5 0 * * * - at 12:05 every night
// */2 * * * * - even minutes for testing
const stripePaymentDailyCheck = new CronJob("*/2 * * * *", async () => {
  // get failed potion breaks that haven't been paid yet
  try {
    const unpaidPotionBreaks = await PotionBreak.query()
      .select("potion_breaks.*")
      .from("potion_breaks")
      .where("potion_breaks.status", "=", "Failure")
      .where("potion_breaks.payment_status", "=", "Unpaid")
      .join("users", "potion_breaks.user_id", "users.id")
      .select("users.steam_id", "users.stripe_customer_id");

    // get setup intents from stripe
    const setupIntents = await Promise.all(
      unpaidPotionBreaks.map(async (potionBreak) => {
        potionBreak.total_value *= 100;
        return await stripe.setupIntents.retrieve(potionBreak.setup_intent_id);
      })
    );

    for (const [i, setupIntent] of setupIntents.entries()) {
      await stripe.paymentIntents.create({
        amount: unpaidPotionBreaks[i].total_value,
        currency: "cad",
        payment_method_types: ["card"],
        customer: unpaidPotionBreaks[i].stripe_customer_id,
        payment_method: setupIntent.payment_method,
        off_session: true,
        confirm: true,
        error_on_requires_action: true,
        // , mandate: true (TODO: NEED TO ADD)
        // , receipt_email: potionBreak[i].user_email
        // , on_behalf_of: USED FOR STRIPE CONNECT
      });

      // remove payment method after payment intent is created
      await stripe.paymentMethods.detach(setupIntent.payment_method);

      // update database to indicate users have paid
      const updatePaymentStatus = await PotionBreak.query()
        .where("setup_intent_id", "=", setupIntent.id)
        .patch({
          payment_status: "Paid",
        });
    }
  } catch (err) {
    console.error(err.message);
  }
});

// run everyday at 1:00am
const steamDataUpdate = new CronJob("0 1 * * *", async () => {
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
            const timeNow = format(new Date("yyyy-MM-dd hh:mm:ss aaaa"));
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
              path_thumbnail: screenshot.path_thumbnail.replace(
                /^http:\/\//i,
                "https://"
              ),
              path_full: screenshot.path_full.replace(
                /^http:\/\//i,
                "https://"
              ),
            });
          } else {
            // update the existing entry if it does exist
            await GameScreenshot.query()
              .findById([game.steam_appid, screenshot.id])
              .patch({
                path_thumbnail: screenshot?.path_thumbnail.replace(
                  /^http:\/\//i,
                  "https://"
                ),
                path_full: screenshot?.path_full.replace(
                  /^http:\/\//i,
                  "https://"
                ),
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
              thumbnail: movie?.thumbnail.replace(/^http:\/\//i, "https://"),
              webm_480: movie?.webm?.["480"].replace(/^http:\/\//i, "https://"),
              webm_max: movie?.webm?.["max"].replace(/^http:\/\//i, "https://"),
              mp4_480: movie?.mp4?.["480"].replace(/^http:\/\//i, "https://"),
              mp4_max: movie?.mp4?.["max"].replace(/^http:\/\//i, "https://"),
            });
          } else {
            // update the existing entry if it does exist
            await GameMovie.query()
              .findById([game.steam_appid, movie.id])
              .patch({
                name: movie?.name,
                thumbnail: movie?.thumbnail,
                webm_480: movie?.webm?.["480"].replace(
                  /^http:\/\//i,
                  "https://"
                ),
                webm_max: movie?.webm?.["max"].replace(
                  /^http:\/\//i,
                  "https://"
                ),
                mp4_480: movie?.mp4?.["480"].replace(/^http:\/\//i, "https://"),
                mp4_max: movie?.mp4?.["max"].replace(/^http:\/\//i, "https://"),
              });
          }
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
});

// start cronjobs
// potionBreakDailyCheck.start();
// stripePaymentDailyCheck.start();
// steamDataUpdate.start();

// export routes up to routes.js
module.exports = router;
