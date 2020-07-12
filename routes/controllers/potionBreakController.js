var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");
var currency = require("currency.js");

const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

// TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)
// TODO: a game can only have 1 potion break active at a time???
// stripe setup
var stripe = require("stripe")(config.STRIPE_SK_TEST);
var accountSid = config.STRIPE_ACCOUNT_SID;
var authToken = config.STRIPE_AUTH_TOKEN;

router.get('/potion-break/create/:appid', function (req, res) {
    const appId = req.params.appid;
    db.get("SELECT * FROM games WHERE app_id = (?)", [appId], function callback(err, row) {
        if (err != null) {
            console.error(err);
        } else {
            let gameInformation = row;
            db.all("SELECT * FROM charities", function callback(err, rows) {
                if (err != null) {
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

router.post('/potion-break-creation-success', async function (req, res) {
    console.log("starting potion-break-creation-success");
    console.log(req.body);
    var potionBreakData = req.body;
    potionBreakData.endDate = Math.floor(new Date(potionBreakData.endDate).getTime() / 1000)
    potionBreakData.amount = currency(potionBreakData.amount).intValue;
    // update database with potion break
    db.serialize(function () {
        db.run("INSERT INTO potion_breaks (start_date, end_date, user_id, app_id, total_value, charity_id, setup_intent_id, status, playtime_start)" +
            " VALUES(?, ?, ?, ?, ?, (SELECT charity_id FROM charities WHERE name = ?), ?, ?, (SELECT total_playtime FROM user_games_owned WHERE app_id = ? AND user_id = ?))",
            [
                potionBreakData.created, potionBreakData.endDate, req.user.user_id, potionBreakData.appId, potionBreakData.amount,
                potionBreakData.charity, potionBreakData.id, "ongoing", potionBreakData.appId, req.user.user_id
            ],
            function (err) {
                if (err != null) {
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

router.get('potion-break/create/:appid/success', function (req, res) {
    console.log('starting potion-break/create/:appid/success');
    const appId = req.params.appid;
    db.serialize(function () {
        db.get("SELECT MAX(potion_break_id) FROM potion_breaks WHERE app_id = ? AND user_id = ?", [appId, req.user.user_id], (err, row) => {
            if (err != null) {
                console.error(err);
            } else {
                const potionBreakId = row;
                db.get("SELECT potion_breaks.start_date, potion_breaks.end_date, potion_breaks.total_value, potion_breaks.status, potion_breaks.playtime_start, games.*, charities.* FROM potion_breaks WHERE potion_break_id = ? INNER JOIN games ON potion_breaks.app_id = games.app_id INNER JOIN charities ON potion_breaks.charity_id = charities.charity_id", [potionBreakId], (err, row) => {
                    if (err != null) {
                        console.error(err);
                    } else {
                        var potionBreakData = row;
                        // convert dates from UNIX format to readable dates
                        potionBreakData.startDate = Math.floor(new Date(potionBreakData.endDate).getTime() * 1000)
                        potionBreakData.endDate = Math.floor(new Date(potionBreakData.endDate).getTime() * 1000)
                        res.render('potion-break-create-success', {
                            user: req.user,
                        });
                    }
                })
            }
        })

    })
})

router.get('/home', (req, res) => {
    console.log("WORKING!");
    res.render('potion-break-create-success');
})

// export routes up to routes.js
module.exports = router;