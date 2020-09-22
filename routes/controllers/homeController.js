var express = require("express");
var router = express.Router();
var checkLogin = require("../../config/checkLoginMiddleware.js");
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
        const response = await Game.query()
          .findById(570)
          .withGraphFetched("screenshots")
          .withGraphFetched("movies")
          .then((game) => {
            return game;
          });
        return response;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getDivinityData = async () => {
      try {
        const response = await Game.query()
          .findById(435150)
          .withGraphFetched("screenshots")
          .withGraphFetched("movies")
          .then((game) => {
            return game;
          });
        return response;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getHalflifeData = async () => {
      try {
        const response = await Game.query()
          .findById(546560)
          .withGraphFetched("screenshots")
          .withGraphFetched("movies")
          .then((game) => {
            return game;
          });
        return response;
      } catch (err) {
        console.error(err.message);
      }
    };

    const getCharitiesData = async () => {
      try {
        const response = Charity.query()
          .findByIds([1, 2, 5])
          .then((charities) => {
            return charities;
          });
        return response;
      } catch (err) {
        console.error(err.message);
      }
    };

    const dota = await getDotaData();
    const divinity = await getDivinityData();
    const halflife = await getHalflifeData();
    const charities = await getCharitiesData();

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
