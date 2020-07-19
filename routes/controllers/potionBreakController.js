var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
var db = require("../../config/db.js");
var moment = require('moment');

// TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)
// TODO: a game can only have 1 potion break active at a time???

router.get('/potion-break/create/:appid', function (req, res) {
    const appId = req.params.appid;
    db.get("SELECT * FROM games WHERE app_id = (?)", [appId], function callback(err, row) {
        if (err) {
            console.error(err);
        } else {
            let gameInformation = row;
            db.all("SELECT * FROM charities", function callback(err, rows) {
                if (err) {
                    console.error(err);
                } else {
                    let charitiesInformation = rows;
                    res.render('create-potion-break', {
                        user: req.user,
                        game: gameInformation,
                        charities: charitiesInformation
                    })
                }
            })
        }
    })
})

router.get('/potion-breaks/view/all', function (req, res) {
    db.serialize(function () {
        db.all("SELECT potion_breaks.potion_break_id, potion_breaks.start_date, potion_breaks.end_date, potion_breaks.total_value, potion_breaks.status, potion_breaks.playtime_start, potion_breaks.app_id, games.name AS game_name, games.img_icon_url AS game_img_icon_url, games.img_logo_url AS game_img_logo_url, potion_breaks.charity_id, charities.name AS charity_name, charities.description AS charity_description FROM potion_breaks INNER JOIN games ON potion_breaks.app_id = games.app_id INNER JOIN charities ON potion_breaks.charity_id = charities.charity_id", [], function (err, rows) {
            if (err) {
                console.error(err);
            } else {
                console.log(rows);
                let potionBreakData = rows;
                // convert playtime to HH:MM
                potionBreakData.forEach(function (value, index, array) {
                    value.playtime_start_hours = (Math.floor(value.playtime_start / 60));
                    value.playtime_start_minutes = (value.playtime_start % 60);
                })

                res.render('get-potion-breaks', {
                    potionBreakData: potionBreakData
                });
            }
        })
    })
})

router.post('/potion-break-creation-success', async function (req, res) {
    console.log("starting potion-break-creation-success");
    console.log(req.body);
    console.log("BEFORE");
    var potionBreakData = req.body;

    // conversions (to UNIX and $xx.xx format)
    // const unixEndDate = moment(potionBreakData.endDate).format("X");
    // potionBreakData.endDate = unixEndDate;
    // const unixDateCreated = moment.unix(potionBreakData.dateCreated).format("X");
    // potionBreakData.dateCreated = unixDateCreated;

    // conversion from UNIX timestamp to YYYY-MM-DD
    const formattedStartDate = moment.unix(potionBreakData.dateCreated).format("YYYY-MM-DD");
    potionBreakData.formattedDate = formattedStartDate;

    console.log("AFTER");
    console.log(potionBreakData);

    // update database with potion break
    db.serialize(function () {
        db.run("INSERT INTO potion_breaks (start_date, end_date, user_id, app_id, total_value, charity_id, setup_intent_id, status, playtime_start, stripe_payment_date_created)" +
            " VALUES(?, ?, ?, ?, ?, (SELECT charity_id FROM charities WHERE name = ?), ?, ?, (SELECT playtime_forever FROM user_games_owned WHERE app_id = ? AND user_id = ?), ?)",
            [
                potionBreakData.formattedDate, potionBreakData.endDate, req.user.user_id, potionBreakData.appId, potionBreakData.paymentAmount,
                potionBreakData.charityName, potionBreakData.setupIntentId, "Ongoing", potionBreakData.appId, req.user.user_id, potionBreakData.dateCreated
            ],
            function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success");

                    // redirect user to summary page
                    return res.redirect('potion-break/create/' + potionBreakData.appId + '/success');
                }
            })
    })
    // 
})

router.get('/potion-break/create/:appid/success', function (req, res) {
    console.log('starting potion-break/create/:appid/success');
    const appId = req.params.appid;
    db.serialize(function () {
        db.get("SELECT MAX(potion_break_id) FROM potion_breaks WHERE app_id = ? AND user_id = ?", [appId, req.user.user_id], function (err, row) {
            if (err) {
                console.error(err);
            } else {
                const potionBreakId = row["MAX(potion_break_id)"];
                console.log(potionBreakId);
                db.get("SELECT potion_breaks.start_date, potion_breaks.end_date, potion_breaks.total_value, potion_breaks.status, potion_breaks.playtime_start, potion_breaks.app_id, games.name AS game_name, games.img_icon_url AS game_img_icon_url, games.img_logo_url AS game_img_logo_url, potion_breaks.charity_id, charities.name AS charity_name, charities.description AS charity_description, charities.img_path AS charity_img_path FROM potion_breaks INNER JOIN games ON potion_breaks.app_id = games.app_id INNER JOIN charities ON potion_breaks.charity_id = charities.charity_id WHERE potion_break_id = ?", [potionBreakId], function (err, row) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(row);
                        var potionBreakData = row;
                        console.log(potionBreakData);

                        // convert unix time to this format - Thursday, July 23rd 2020
                        potionBreakData.formatted_start_date = moment(potionBreakData.start_date).format("dddd, MMMM Do YYYY");
                        potionBreakData.formatted_end_date = moment(potionBreakData.end_date).format("dddd, MMMM Do YYYY");
                        // calculate duration of potion break
                        var start = moment(potionBreakData.start_date);
                        var end = moment(potionBreakData.end_date);
                        potionBreakData.total_days = end.diff(start, 'days');
                        // convert total time played from minutes to hours:minutes
                        potionBreakData.playtime_start_hours = (Math.floor(potionBreakData.playtime_start / 60));
                        potionBreakData.playtime_start_minutes = (potionBreakData.playtime_start % 60);

                        console.log(potionBreakData);
                        res.render('potion-break-create-success', {
                            user: req.user,
                            potionBreakData: potionBreakData
                        });
                    }
                })
            }
        })

    })
})

// export routes up to routes.js
module.exports = router;