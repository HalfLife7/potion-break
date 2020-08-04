var express = require("express");
var moment = require('moment');
var config = require("../../config/config.js");
var moment = require('moment');
var router = express.Router();
const Axios = require("axios");
const stripe = require('stripe')(process.env.STRIPE_SK_TEST);
var CronJob = require('cron').CronJob;
var Promise = require("bluebird");
const AppDAO = require("../../db/dao.js");
const {
    join,
    resolve,
    reject
} = require("bluebird");
const dao = new AppDAO('./database.db');
var Bottleneck = require("bottleneck/es5");
const Bluebird = require("bluebird");

//  0 0 * * * - at midnight every night
var potionBreakDailyCheck = new CronJob('0 0 * * *', function () {
    // get users who have potion break ending that night
    const dateToday = moment().format("YYYY-MM-DD");

    var sql = `
    SELECT 
        potion_breaks.*, 
        users.steam_id, 
        users.stripe_customer_id 
    FROM potion_breaks 
    INNER JOIN users ON potion_breaks.user_id = users.user_id 
    WHERE potion_breaks.end_date = ? AND status = ?
    `;
    var params = [dateToday, "Ongoing"];
    let dbGetAllEndingPotionBreaks = dao.all(sql, params)
        .then((potionBreakData) => {
            // get user play time through steam api
            return Promise.all(potionBreakData.map((potionBreak) => {
                    return Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
                            params: {
                                steamid: potionBreak.steam_id,
                                key: process.env.STEAM_API_KEY,
                                include_played_free_games: true,
                                include_appinfo: true,
                                format: 'json',
                                'appids_filter[0]': potionBreak.app_id
                            }
                        })
                        .then((response) => {
                            return (response.data.response.games[0]);
                        })
                }))
                .then((userSteamData) => {
                    return ([potionBreakData, userSteamData]);
                })
        })
        .then((data) => {
            let potionBreakData = data[0];
            let userGameData = data[1];

            // compare user current playtime to initial playtime (when potion break started)
            return Promise.all(potionBreakData.map((potionBreak, i) => {
                let userPreviousPlaytime = potionBreak.playtime_start;
                let userCurrentPlaytime = userGameData[i].playtime_forever;

                // if user played (increase playtime) -> fail potion break
                if (userPreviousPlaytime < userCurrentPlaytime) {
                    // update user game data
                    var sql = `
                    UPDATE potion_breaks 
                    SET status = ?, 
                    playtime_end = ?, 
                    payment_status = ? 
                    WHERE potion_break_id = ?
                    `;
                    var params = ["Failure", userCurrentPlaytime, "Unpaid", potionBreak.potion_break_id];

                    let dbUpdateUserPotionBreakFail = dao.run(sql, params);
                    return dbUpdateUserPotionBreakFail;

                } else {
                    // if user hasn't played (same playtime) -> succeed potion break
                    var sql = `
                        UPDATE potion_breaks 
                        SET status = ?, 
                        playtime_end = ?, 
                        payment_status = ? 
                        WHERE potion_break_id = ?
                    `;
                    params = ["Success", userCurrentPlaytime, "N/A", potionBreak.potion_break_id];
                    let dbUpdateUserPotionBreakSuccess = dao.run(sql, params);

                    return dbUpdateUserPotionBreakSuccess;
                }
            }))
        })
        .then(() => {
            // get successful potion breaks
            var sql = `
                SELECT 
                    potion_breaks.*, 
                    users.steam_id, 
                    users.stripe_customer_id 
                FROM potion_breaks 
                INNER JOIN users ON potion_breaks.user_id = users.user_id 
                WHERE potion_breaks.end_date = ? AND status = ?
                `;
            var params = [dateToday, "Success"];
            let dbGetAllSuccessPotionBreaksFromToday = dao.all(sql, params);
            return dbGetAllSuccessPotionBreaksFromToday;
        })
        .then((potionBreaks) => {
            // get the setupIntents from stripe api
            return Promise.all(potionBreaks.map((potionBreak) => {
                let {
                    setup_intent_id
                } = potionBreak;
                return stripe.setupIntents.retrieve(potionBreak.setup_intent_id);
            }))
        })
        .then((setupIntents) => {
            // remove the payment methods tied to the setupIntents 
            // (no longer need to charge them since the potion break was successful)
            console.log(setupIntents);
            return Promise.all(setupIntents.map((setupIntent) => {
                let {
                    payment_method
                } = setupIntent;
                return stripe.paymentMethods.detach(setupIntent.payment_method);
            }))
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
});

// 5 0 * * * - at 12:05 every night
var stripePaymentDailyCheck = new CronJob('5 0 * * *', function () {

    // get failed potion breaks that haven't been paid yet
    var sql = `
    SELECT 
        potion_breaks.*, 
        users.steam_id, 
        users.stripe_customer_id 
    FROM potion_breaks 
    INNER JOIN users ON potion_breaks.user_id = users.user_id 
    WHERE potion_breaks.status = ? AND potion_breaks.payment_status = ?
    `;
    var params = ["Failure", "Unpaid"];
    let dbGetAllUnpaidPotionBreaks = dao.all(sql, params)
        .then((unpaidPotionBreaks) => {
            // get the setupintents from the stripe api
            return Promise.all(unpaidPotionBreaks.map((potionBreak) => {
                    potionBreak.total_value = potionBreak.total_value * 100;
                    return stripe.setupIntents.retrieve(potionBreak.setup_intent_id)
                }))
                .then((setupIntents) => {
                    return ([unpaidPotionBreaks, setupIntents]);
                })
        })
        .then((data) => {
            let unpaidPotionBreaks = data[0];
            let setupIntents = data[1];

            // charge the users by creating paymentIntents through stripe api
            return Promise.all(setupIntents.map((setupIntent, i) => {
                    return stripe.paymentIntents.create({
                        amount: unpaidPotionBreaks[i].total_value,
                        currency: 'cad',
                        payment_method_types: ['card'],
                        customer: unpaidPotionBreaks[i].stripe_customer_id,
                        payment_method: setupIntent.payment_method,
                        off_session: true,
                        confirm: true,
                        error_on_requires_action: true
                        //, mandate: true (TODO: NEED TO ADD)
                        //, receipt_email: potionBreak[i].user_email
                        //, on_behalf_of: USED FOR STRIPE CONNECT
                    })
                }))
                .then((paymentIntents) => {
                    console.log(paymentIntents);
                    return setupIntents;
                })
        })
        .then((setupIntents) => {
            // detach the payment methods once the users have been charged

            return Promise.all(setupIntents.map((setupIntent, i) => {
                    return stripe.paymentMethods.detach(setupIntent.payment_method);
                }))
                .then((paymentMethods) => {
                    return setupIntents;
                })
        })
        .then((setupIntents) => {
            // update the database to indicate that the users have paid

            return Promise.all(setupIntents.map((setupIntent) => {
                var sql = `
                    UPDATE potion_breaks 
                    SET payment_status = ? 
                    WHERE setup_intent_id = ?
                `;
                var params = ["Paid", setupIntent.id];
                let dbUpdatePotionBreakStatus = dao.run(sql, params);
                return dbUpdatePotionBreakStatus;
            }))
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
});

// run everyday at 1:00am
var steamDataUpdate = new CronJob('0 1 * * *', function () {
    // cron job to update steam game screenshots, movies, etc.
    // get all games in db
    var sql = `
    SELECT 
        app_id, 
        name
    FROM games
    `;
    var params = [];
    let dbGetAllGames = dao.all(sql, params)
        .then((gamesData) => {
            // use bottleneck's limiter to throttle api calls to 1/sec (1000ms)
            const limiter = new Bottleneck({
                maxConcurrent: 1,
                minTime: 1000
            });

            return Promise.all(gamesData.map((game) => {
                return myValues = limiter.schedule(() => {
                    return Axios.get("https://store.steampowered.com/api/appdetails", {
                            params: {
                                appids: game.app_id,
                                format: 'json'
                            }
                        })
                        .then((response) => {
                            let timeNow = moment().format("DD MM YYYY hh:mm:ss.SSS");
                            console.log(game.name + " - " + game.app_id + " - " + timeNow);


                            // fix for games that cannot be queried by the store.steampowered api (such as dead island - 91310)
                            if (response.data[game.app_id].data === undefined) {
                                game.steam_appid = game.app_id;
                                return (game);
                            } else {
                                return (response.data[game.app_id].data);
                            }
                        })
                        .catch((err) => {
                            console.error("Error: " + err);
                        })
                })
            }))
        })
        .then((steamGameData) => {
            const dateToday = moment().format("YYYY-MM-DD");
            return Promise.all(steamGameData.map((gameData, i) => {
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

                var headerImage = getSafe(() => gameData.header_image, null);
                var name = getSafe(() => gameData.name, null);
                var screenshot1 = getSafe(() => gameData.screenshots[0].path_full, null);
                var screenshot2 = getSafe(() => gameData.screenshots[1].path_full, null);
                var screenshot3 = getSafe(() => gameData.screenshots[2].path_full, null);
                var screenshot4 = getSafe(() => gameData.screenshots[3].path_full, null);
                var screenshot5 = getSafe(() => gameData.screenshots[4].path_full, null);
                var movie1thumbnail = getSafe(() => gameData.movies[0].thumbnail, null);
                var movie1webm = getSafe(() => gameData.movies[0].webm.max, null);
                var movie1mp4 = getSafe(() => gameData.movies[0].mp4.max, null);
                var steam_appid = getSafe(() => gameData.steam_appid, null);

                var sql = `
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
                var params = [name, headerImage, screenshot1, screenshot2, screenshot3, screenshot4, screenshot5, movie1thumbnail, movie1webm, movie1mp4, dateToday, steam_appid];
                let dbUpdateGames = dao.run(sql, params);
                return dbUpdateGames;

            }))
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
})

// start cronjobs
potionBreakDailyCheck.start();
stripePaymentDailyCheck.start();
steamDataUpdate.start();

// export routes up to routes.js
module.exports = router;