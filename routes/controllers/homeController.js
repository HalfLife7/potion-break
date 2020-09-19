var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../../config/config.js');
var checkLogin = require('../../config/checkLoginMiddleware.js');
const stripe = require('stripe')(process.env.STRIPE_SK_TEST);
const AppDAO = require('../../db.bak/dao.js');
var Promise = require('bluebird');
const { join, resolve, reject } = require('bluebird');
const dao = new AppDAO('./database.db');

// middleware to check if logged in
router.get('/', function (req, res) {
  if (req.user) {
    res.redirect('/game-library');
  } else {
    var sql = `
            SELECT * FROM games 
            WHERE app_id 
            IN (?, ?, ?)
        `;
    var params = ['570', '546560', '435150'];
    let dbGetGames = dao.all(sql, params);

    var sql = `
                    SELECT * FROM charities
                `;
    let dbGetCharities = dao.all(sql, []);

    join(dbGetGames, dbGetCharities, function (gamesData, charitiesData) {
      console.log(gamesData);
      console.log(charitiesData);

      let dota = gamesData[0];
      let divinity = gamesData[1];
      let halflife = gamesData[2];

      res.render('home', {
        dotaData: dota,
        halflifeData: halflife,
        divinityData: divinity,
        charityData: charitiesData,
      });
    }).catch((err) => {
      console.error('Error: ' + err);
    });
  }
});

router.get('/login', checkLogin, function (req, res) {
  res.render('login');
});

// export routes up to routes.js
module.exports = router;
