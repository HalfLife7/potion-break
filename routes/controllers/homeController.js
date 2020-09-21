var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var checkLogin = require("../../config/checkLoginMiddleware.js");
const stripe = require("stripe")(process.env.STRIPE_SK_TEST);
var Promise = require("bluebird");
const { join, resolve, reject } = require("bluebird");

const axios = require("axios").default;

const Game = require("../../models/game");
const Charity = require("../../models/charity");

// middleware to check if logged in
router.get("/", async (req, res) => {
  if (req.user) {
    res.redirect("/game-library");
  } else {
    const getDotaData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: "http://localhost:5000/db/games/570",
        });
        return response.data;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getDivinityData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: "http://localhost:5000/db/games/435150",
        });
        return response.data;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getHalflifeData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: "http://localhost:5000/db/games/546560",
        });
        return response.data;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getCharitiesData = async () => {
      try {
        const response = await axios({
          method: "get",
          url:
            "http://localhost:5000/db/charities/get-multiple-charities?id1=1&id2=2&id3=5",
        });
        return response.data;
      } catch (err) {
        console.error(err.message);
      }
    };

    const dota = await getDotaData();
    const divinity = await getDivinityData();
    const halflife = await getHalflifeData();
    const charities = await getCharitiesData();

    //charities = charities.slice(0, 3);

    console.log(dota);
    console.log(charities);

    res.render("home", {
      dotaData: dota,
      halflifeData: halflife,
      divinityData: divinity,
      charityData: charities,
    });
  }
});

router.get("/login", checkLogin, function (req, res) {
  res.render("login");
});

// export routes up to routes.js
module.exports = router;
