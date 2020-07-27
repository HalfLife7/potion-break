var express = require("express");
const db = require("../../config/db");
var moment = require('moment');
var config = require("../../config/config.js");
var moment = require('moment');
var router = express.Router();
const Axios = require("axios");
const {
    RateLimiter
} = require("limiter");
const stripe = require('stripe')(process.env.STRIPE_SK_TEST);
var rateLimiter = require('limiter').RateLimiter;
var CronJob = require('cron').CronJob;

//  0 0 * * * - at midnight every night
var potionBreakDailyCheck = new CronJob('0 0 * * *', function () {
    // get users who have potion break ending that night
    const dateToday = moment().format("YYYY-MM-DD");
    // update status of potion breaks
    db.serialize(function () {
        db.all("SELECT potion_breaks.*, users.steam_id, users.stripe_customer_id FROM potion_breaks INNER JOIN users ON potion_breaks.user_id = users.user_id WHERE potion_breaks.end_date = ? AND status = ?", [dateToday, "Ongoing"], function (err, rows) {
            if (err) {
                console.error(err);
            } else {
                const potionBreakList = rows;
                // query Steam API to update user's playtime

                potionBreakList.forEach(function (potionBreak, index, array) {
                    Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
                        params: {
                            steamid: potionBreak.steam_id,
                            key: process.env.STEAM_API_KEY,
                            include_played_free_games: true,
                            include_appinfo: true,
                            format: 'json',
                            'appids_filter[0]': potionBreak.app_id
                        }
                    }).then(function (response) {
                        var userGameData = response.data.response.games[0];
                        console.log(userGameData);
                        // check if user playtime has increased

                        userPreviousPlaytime = potionBreak.playtime_start;
                        console.log(userPreviousPlaytime);
                        // if the user's playtime has increased, update the database
                        if (userPreviousPlaytime < userGameData.playtime_forever) {
                            // update user game data
                            db.run("UPDATE potion_breaks SET status = ?, playtime_end = ?, payment_status = ? WHERE potion_break_id = ?", ["Failure", userGameData.playtime_forever, "Unpaid", potionBreak.potion_break_id], function (err) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    // do nothing, just update the user's status
                                }
                            })
                        } else {
                            // if it hasn't update it to show that the potion break was successful
                            db.run("UPDATE potion_breaks SET status = ?, playtime_end = ?, payment_status = ? WHERE potion_break_id = ?", ["Success", userGameData.playtime_forever, "N/A", potionBreak.potion_break_id], function (err) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    // remove user's payment method from this potion break since it is no longer needed
                                    stripe.setupIntents.retrieve(potionBreak.setup_intent_id, function (err, setupIntent) {
                                        // asynchronously called
                                        if (err) {
                                            console.error(err);
                                        } else {
                                            let correctPaymentMethod = setupIntent.payment_method;
                                            stripe.paymentMethods.detach(correctPaymentMethod, function (err, paymentMethod) {
                                                // asynchronously called
                                                if (err) {
                                                    console.err(err);
                                                } else {
                                                    console.log(paymentMethod);
                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            }
        })
    })
});

// 5 0 * * * - at 12:05 every night
var stripePaymentDailyCheck = new CronJob('5 0 * * *', function () {
    // charge users if they have failed
    db.serialize(function () {
        // get all potion breaks that have 'failed' and are 'unpaid'
        db.all("SELECT potion_breaks.*, users.steam_id, users.stripe_customer_id FROM potion_breaks INNER JOIN users ON potion_breaks.user_id = users.user_id WHERE potion_breaks.status = ? AND potion_breaks.payment_status = ?", ["Failure", "Unpaid"], function (err, rows) {
            if (err) {
                console.error(err);

            } else {
                unpaidPotionBreaks = rows;
                console.log(unpaidPotionBreaks);
                // for each of those failed and unpaid -> get the payment methods associated to that user

                unpaidPotionBreaks.forEach(function (potionBreak, index, array) {
                    // adjust database value for total_value since stripe's money value is in pennies
                    potionBreak.total_value = potionBreak.total_value * 100;
                    stripe.setupIntents.retrieve(potionBreak.setup_intent_id, function (err, setupIntent) {
                        // asynchronously called
                        if (err) {
                            console.error(err);
                        } else {
                            // return the payment method that is associated to the failed/unpaid potion break
                            let correctPaymentMethod = setupIntent.payment_method;
                            console.log(correctPaymentMethod);
                            // charge this payment method for the amount agreed upon
                            stripe.paymentIntents.create({
                                    amount: potionBreak.total_value,
                                    currency: 'cad',
                                    payment_method_types: ['card'],
                                    customer: potionBreak.stripe_customer_id,
                                    payment_method: correctPaymentMethod,
                                    off_session: true,
                                    confirm: true,
                                    error_on_requires_action: true
                                    //, mandate: true (TODO: NEED TO ADD)
                                    //, receipt_email: potionBreak.user_email
                                    //, on_behalf_of: USED FOR STRIPE CONNECT
                                },
                                function (err, paymentIntent) {
                                    // asynchronously called
                                    if (err) {
                                        console.error(err);

                                    } else {
                                        // remove payment method from customer once transaction is complete
                                        console.log(paymentIntent);
                                        stripe.paymentMethods.detach(correctPaymentMethod, function (err, paymentMethod) {
                                            // asynchronously called
                                            if (err) {
                                                console.err(err);
                                            } else {
                                                console.log(paymentMethod);
                                                // update database to show payment complete?
                                                db.run("UPDATE potion_breaks SET payment_status = ? WHERE potion_break_id = ?", ["Paid", potionBreak.potion_break_id], function (err) {
                                                    if (err) {
                                                        console.error(err);

                                                    } else {
                                                        // do nothing
                                                    }
                                                })
                                            }
                                        });
                                    }
                                }
                            );
                        }
                    });
                })
            }
        })
    })
});

var steamDataUpdate = new CronJob('*/2 * * * *', function () {
    db.serialize(function () {
        db.all("SELECT app_id, last_updated FROM games", function (err, rows) {
            if (err) {
                console.error(err);
            } else {
                //console.log(rows);
                gamesData = rows;

                // limit a call to once per 2000ms (2 sec)
                let limiter = new RateLimiter(1, 1500);

                gamesData.forEach(function (game, index, array) {
                    // if game data has not been updated for 2 weeks (14 days), update it OR if it's new
                    let lastUpdated = moment(game.last_updated)
                    const dateToday = moment().format("YYYY-MM-DD");
                    let dateDifference = Math.abs((lastUpdated.diff(dateToday, 'days')));

                    if (dateDifference >= 14 || game.last_updated === null) {
                        // query API
                        limiter.removeTokens(1, function () {
                                Axios.get('https://store.steampowered.com/api/appdetails', {
                                    params: {
                                        appids: game.app_id,
                                        format: 'json'
                                    }
                                }).then(function (response) {
                                    let gameData = response.data[game.app_id].data;
                                    try {
                                        var headerImage = gameData.header_image;
                                        var name = gameData.name;
                                        var screenshot1 = gameData.screenshots[0].path_full;
                                        var screenshot2 = gameData.screenshots[1].path_full;
                                        var screenshot3 = gameData.screenshots[2].path_full;
                                        var screenshot4 = gameData.screenshots[3].path_full;
                                        var screenshot5 = gameData.screenshots[4].path_full;
                                        var movie1thumbnail = gameData.movies[0].thumbnail;
                                        var movie1webm = gameData.movies[0].webm.max;
                                        var movie1mp4 = gameData.movies[0].mp4.max;

                                    } catch (err) {
                                        console.log("Error on " + game.app_id);
                                        console.error(err);
                                    }

                                    db.run("UPDATE games SET name = ?, header_image_url = ?, screenshot_1_url = ?, screenshot_2_url = ?, screenshot_3_url = ?," +
                                        "screenshot_4_url = ?, screenshot_5_url = ?, movie_1_thumbnail = ?, movie_1_webm_url = ?, movie_1_mp4_url = ?, last_updated = ? WHERE app_id = ? ",
                                        [name, headerImage, screenshot1, screenshot2, screenshot3, screenshot4, screenshot5, movie1thumbnail, movie1webm, movie1mp4, dateToday, game.app_id],
                                        function (err) {
                                            if (err) {
                                                console.error(err)
                                            } else {
                                                let timeNow = moment().format("DD MM YYYY hh:mm:ss.SSS")
                                                console.log(game.app_id + " - " + timeNow);
                                            }
                                        })
                                })

                            },
                            function (error) {
                                console.error(error);
                            })
                    }
                })
            }
        })
    })
})

// start cronjobs
potionBreakDailyCheck.start();
stripePaymentDailyCheck.start();
steamDataUpdate.start();

// export routes up to routes.js
module.exports = router;