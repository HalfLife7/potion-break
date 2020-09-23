const express = require("express");

const router = express.Router();
const checkLogin = require("../../config/checkLoginMiddleware.js");

const Game = require("../../models/game");
const Charity = require("../../models/charity");

// middleware to check if logged in
router.get("/", async (req, res) => {
  try {
    if (req.user) {
      res.redirect("/game-library");
    } else {
      const dota = await Game.query()
        .findById(570)
        .withGraphFetched("screenshots")
        .withGraphFetched("movies");

      const halflife = await Game.query()
        .findById(435150)
        .withGraphFetched("screenshots")
        .withGraphFetched("movies");

      const divinity = await Game.query()
        .findById(546560)
        .withGraphFetched("screenshots")
        .withGraphFetched("movies");

      const charities = Charity.query().findByIds([1, 2, 5]);

      res.render("home", {
        dotaData: dota,
        halflifeData: halflife,
        divinityData: divinity,
        charityData: charities,
      });
    }
  } catch (err) {
    console.error(err.message);
  }
});

router.get("/login", checkLogin, function (req, res) {
  res.render("login");
});

// export routes up to routes.js
module.exports = router;
