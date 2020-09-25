const express = require("express");
const moment = require("moment");

const router = express.Router();
const Axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SK_TEST);
const { CronJob } = require("cron");

const Bottleneck = require("bottleneck/es5");

const PotionBreak = require("../../models/potionBreak");
const UserGame = require("../../models/userGame");

//  0 0 * * * - at midnight every night
// 1-59/2 * * * * - odd minute for testing
const potionBreakDailyCheck = new CronJob("0 0 * * *", async () => {
  try {
    // get users who have potion break ending that night
    const dateToday = moment().format("YYYY-MM-DD");

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
const stripePaymentDailyCheck = new CronJob("5 0 * * *", async () => {
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
      console.log(setupIntent);
      console.log(unpaidPotionBreaks[i]);
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
const steamDataUpdate = new CronJob("0 1 * * *", function () {
  // cron job to update steam game screenshots, movies, etc.
  // get all games in db
  const sql = `
    SELECT 
        app_id, 
        name
    FROM games
    `;
  const params = [];
  const dbGetAllGames = dao
    .all(sql, params)
    .then((gamesData) => {
      // use bottleneck's limiter to throttle api calls to 1/sec (1000ms)
      const limiter = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1000,
      });

      return Promise.all(
        gamesData.map((game) => {
          return (myValues = limiter.schedule(() => {
            return Axios.get("https://store.steampowered.com/api/appdetails", {
              params: {
                appids: game.app_id,
                format: "json",
              },
            })
              .then((response) => {
                const timeNow = moment().format("DD MM YYYY hh:mm:ss.SSS");
                console.log(`${game.name} - ${game.app_id} - ${timeNow}`);

                // fix for games that cannot be queried by the store.steampowered api (such as dead island - 91310)
                if (response.data[game.app_id].data === undefined) {
                  game.steam_appid = game.app_id;
                  return game;
                }
                return response.data[game.app_id].data;
              })
              .catch((err) => {
                console.error(`Error: ${err}`);
              });
          }));
        })
      );
    })
    .then((steamGameData) => {
      const dateToday = moment().format("YYYY-MM-DD");
      return Promise.all(
        steamGameData.map((gameData, i) => {
          // https://stackoverflow.com/questions/33757931/is-there-something-like-the-swift-optional-chaining-in-javascript
          // use getSafe function as alternative to optional chaining (not available in Node.js)
          // getSafe will attempt to get the value of an object's property and if it is undefined, it will return a default value (second parameter)
          function getSafe(fn, defaultVal) {
            try {
              return fn();
            } catch (e) {
              return defaultVal;
            }
          }

          const headerImage = getSafe(() => gameData.header_image, null);
          const name = getSafe(() => gameData.name, null);
          const screenshot1 = getSafe(
            () => gameData.screenshots[0].path_full,
            null
          );
          const screenshot2 = getSafe(
            () => gameData.screenshots[1].path_full,
            null
          );
          const screenshot3 = getSafe(
            () => gameData.screenshots[2].path_full,
            null
          );
          const screenshot4 = getSafe(
            () => gameData.screenshots[3].path_full,
            null
          );
          const screenshot5 = getSafe(
            () => gameData.screenshots[4].path_full,
            null
          );
          const movie1thumbnail = getSafe(
            () => gameData.movies[0].thumbnail,
            null
          );
          const movie1webm = getSafe(() => gameData.movies[0].webm.max, null);
          const movie1mp4 = getSafe(() => gameData.movies[0].mp4.max, null);
          const steam_appid = getSafe(() => gameData.steam_appid, null);

          const sql = `
                    UPDATE games 
                    SET 
                        name = ? , 
                        header_image_url = ?, 
                        screenshot_1_url = ?, 
                        screenshot_2_url = ?, 
                        screenshot_3_url = ?, 
                        screenshot_4_url = ?, 
                        screenshot_5_url = ?, 
                        movie_1_thumbnail = ?, 
                        movie_1_webm_url = ?, 
                        movie_1_mp4_url = ?, 
                        last_updated = ? 
                    WHERE app_id = ?
                `;
          const params = [
            name,
            headerImage,
            screenshot1,
            screenshot2,
            screenshot3,
            screenshot4,
            screenshot5,
            movie1thumbnail,
            movie1webm,
            movie1mp4,
            dateToday,
            steam_appid,
          ];
          const dbUpdateGames = dao.run(sql, params);
          return dbUpdateGames;
        })
      );
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
    });
});

// start cronjobs
// potionBreakDailyCheck.start();
// stripePaymentDailyCheck.start();
// steamDataUpdate.start();

// export routes up to routes.js
module.exports = router;
