const fs = require("fs");
const express = require("express");
var checkLogin = require("../../config/checkLoginMiddleware");

const router = express.Router();
var checkLogin = require("../../config/checkLoginMiddleware.js");

const User = require("../../models/user");
const UserGame = require("../../models/userGame");

// middleware to check if logged in
router.get("/user-profile", checkLogin, async (req, res) => {
  console.log(req.user);
  const userData = await User.query()
    .findById(req.user.id)
    .select(
      "id",
      "steam_persona_name",
      "steam_profile",
      "steam_id",
      "steam_avatar",
      "total_steam_games_owned",
      "total_steam_games_played",
      "name",
      "email"
    );

  const userTotalMinutesPlayed = await UserGame.query()
    .sum("playtime_forever as total_minutes_played")
    .where("user_id", "=", req.user.id);

  const userTotalGamesPlayed = await UserGame.query()
    .count("game_id as total_games_played")
    .where("user_id", "=", req.user.id);

  userData.total_minutes_played =
    userTotalMinutesPlayed[0].total_minutes_played;
  userData.total_games_played = userTotalGamesPlayed[0].total_games_played;

  const hours = Math.floor(userData.total_minutes_played / 60);
  const minutes = userData.total_minutes_played - hours * 60;
  if (hours === 0) {
    userData.total_time_played = `${minutes} minutes`;
  } else {
    userData.total_time_played = `${hours} hours and ${minutes} minutes`;
  }

  const files = fs.readdirSync("public/images/hero/user-profile");
  const randomImage = files[Math.floor(Math.random() * files.length)];

  res.render("user-profile", {
    user: userData,
    image: randomImage,
  });
});

router.post("/update-user-profile", async (req, res) => {
  const formData = req.body;

  const updateUser = await User.query().findById(req.user.id).patch({
    name: formData.name,
    email: formData.email,
  });

  req.user.name = formData.name;
  req.user.email = formData.email;

  res.redirect("/user-profile");
});
// export routes up to routes.js
module.exports = router;
