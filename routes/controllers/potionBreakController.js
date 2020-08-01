var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
var moment = require('moment');
var fs = require('fs');
var Promise = require("bluebird");
const AppDAO = require("../../db/dao.js");
const {
    join,
    resolve,
    reject
} = require("bluebird");
const dao = new AppDAO('./database.db');

// TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)
// TODO: a game can only have 1 potion break active at a time???

router.get('/potion-break/create/:appid', function (req, res) {
    const appId = req.params.appid;

    var sql = `
    SELECT * FROM games 
    WHERE app_id = ( ? )
    `;
    var params = [appId];
    let dbGetGame = dao.get(sql, params)

    var sql = `
    SELECT * FROM charities
    `;
    var params = [];
    let dbGetAllCharities = dao.all(sql, params);

    join(dbGetGame, dbGetAllCharities, function (gameData, charitiesData) {
            var files = fs.readdirSync('public/images/hero/create-potion-break')
            let randomImage = files[Math.floor(Math.random() * files.length)]

            res.render('create-potion-break', {
                user: req.user,
                game: gameData,
                charities: charitiesData,
                image: randomImage
            })
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
})

router.get('/potion-breaks/view/all', function (req, res) {
    var sql = `
    SELECT 
    potion_breaks.potion_break_id, 
    potion_breaks.start_date, 
    potion_breaks.end_date, 
    potion_breaks.user_id, 
    potion_breaks.total_value, 
    potion_breaks.status, 
    potion_breaks.playtime_start, 
    potion_breaks.app_id, 
    games.name AS game_name, 
    games.img_icon_url AS game_img_icon_url, 
    games.img_logo_url AS game_img_logo_url, 
    potion_breaks.charity_id, 
    charities.name AS charity_name, 
    charities.description AS charity_description 
    FROM potion_breaks 
    INNER JOIN games ON potion_breaks.app_id = games.app_id 
    INNER JOIN charities ON potion_breaks.charity_id = charities.charity_id 
    WHERE user_id = ?
    `;
    var params = [req.user.user_id];
    let dbGetAllPotionBreaks = dao.all(sql, params)
        .then((potionBreakData) => {
            potionBreakData.forEach(function (value, index, array) {
                value.playtime_start_hours = (Math.floor(value.playtime_start / 60));
                value.playtime_start_minutes = (value.playtime_start % 60);
            })

            var files = fs.readdirSync('public/images/hero/view-all-potion-breaks')
            let randomImage = files[Math.floor(Math.random() * files.length)]

            res.render('view-all-potion-breaks', {
                potionBreakData: potionBreakData,
                image: randomImage
            });
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
})

router.post('/potion-break-creation-success', async function (req, res) {
    var potionBreakData = req.body;
    console.log(potionBreakData);

    // conversions (to UNIX and $xx.xx format)
    // const unixEndDate = moment(potionBreakData.endDate).format("X");
    // potionBreakData.endDate = unixEndDate;
    // const unixDateCreated = moment.unix(potionBreakData.dateCreated).format("X");
    // potionBreakData.dateCreated = unixDateCreated;

    // conversion from UNIX timestamp to YYYY-MM-DD
    const formattedStartDate = moment.unix(potionBreakData.dateCreated).format("YYYY-MM-DD");
    potionBreakData.formattedDate = formattedStartDate;

    var sql = `
    INSERT INTO potion_breaks (
        start_date, 
        end_date, 
        user_id, 
        app_id, 
        total_value, 
        charity_id, 
        setup_intent_id, 
        status, 
        playtime_start, 
        stripe_payment_date_created) 
        VALUES(?, ?, ?, ?, ?, 
            (SELECT charity_id 
                FROM charities 
                WHERE name = ?), 
            ?, ?, 
            (SELECT playtime_forever 
                FROM user_games_owned 
                WHERE app_id = ? AND user_id = ?), 
            ?)
    `;
    var params = [
        potionBreakData.formattedDate,
        potionBreakData.endDate,
        req.user.user_id,
        potionBreakData.appId,
        potionBreakData.paymentAmount,
        potionBreakData.charityName,
        potionBreakData.setupIntentId,
        "Ongoing",
        potionBreakData.appId,
        req.user.user_id,
        potionBreakData.dateCreated
    ];
    // update database with potion break
    let dbInsertPotionBreak = dao.run(sql, params)
        .then(() => {
            // redirect user to summary page
            return res.redirect('potion-break/create/' + potionBreakData.appId + '/success');
        })
        .catch((err) => {
            console.error("Error : " + err);
        })
})

router.get('/potion-break/create/:appid/success', function (req, res) {
    console.log('starting potion-break/create/:appid/success');
    const appId = req.params.appid;

    var sql = `
    SELECT MAX (potion_break_id) 
    FROM potion_breaks 
    WHERE app_id = ? AND user_id = ?
    `;
    var params = [appId, req.user.user_id];
    let dbGetPotionBreakId = dao.get(sql, params)
        .then((potionBreakData) => {
            console.log(potionBreakData);
            const potionBreakId = potionBreakData["MAX (potion_break_id)"];
            console.log(potionBreakId);
            var sql = `
            SELECT 
                potion_breaks.start_date, 
                potion_breaks.end_date, 
                potion_breaks.total_value, 
                potion_breaks.status, 
                potion_breaks.playtime_start, 
                potion_breaks.app_id, 
                games.name AS game_name, 
                games.img_icon_url AS game_img_icon_url, 
                games.img_logo_url AS game_img_logo_url, 
                potion_breaks.charity_id, 
                charities.name AS charity_name, 
                charities.description AS charity_description, 
                charities.img_path AS charity_img_path 
            FROM potion_breaks 
            INNER JOIN games ON potion_breaks.app_id = games.app_id 
            INNER JOIN charities ON potion_breaks.charity_id = charities.charity_id 
            WHERE potion_break_id = ?
            `;
            var params = [potionBreakId];
            return dbGetPotionBreak = dao.get(sql, params);
        })
        .then((potionBreakData) => {
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

            var files = fs.readdirSync('public/images/hero/potion-break-success')
            let randomImage = files[Math.floor(Math.random() * files.length)]

            res.render('potion-break-create-success', {
                user: req.user,
                potionBreakData: potionBreakData,
                image: randomImage
            });
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
})

// export routes up to routes.js
module.exports = router;