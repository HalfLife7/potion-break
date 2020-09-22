import express from "express";

const router = express.Router();

const User = require("../../models/user");

router.get("/search-by-steam-id", (req, res, next) => {
  const userId = req.query.id;

  User.query()
    .findOne("steam_id", "=", userInfo.steamid)
    .then((user) => {
      console.log("complete checkUserExists");
      res.send(user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.post("/new", (req, res, next) => {
  const newUser = req.body;

  User.query()
    .insert({
      steam_persona_name: newUser.steam_persona_name,
      steam_profile: newUser.steam_profile,
      steam_id: newUser.steam_id,
      steam_avatar: newUser.steam_avatar,
    })
    .then((user) => {
      console.log("complete insertUser");
      res.send(user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.put("/update/passport", (req, res, next) => {
  const userDetails = req.body;

  User.query()
    .findOne("steam_id", "=", userDetails.steam_id)
    .patch({
      steam_persona_name: userDetails.steam_persona_name,
      steam_profile: userDetails.steam_profile,
      steam_avatar: userDetails.steam_avatar,
    })
    .then((user) => {
      console.log("complete update/passport");
      console.log(user);
      res.send("Successfully updated User ID: " + user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.put("/update/total-games", (req, res, next) => {
  const userDetails = req.body;

  User.query()
    .findOne("id", "=", userDetails.user_id)
    .patch({
      total_steam_games_owned: userInfo.total_steam_games_owned,
      total_steam_games_played: userInfo.total_steam_games_played,
    })
    .then((user) => {
      console.log("complete update/total-games");
      console.log(user);
      res.send("Successfully updated User ID: " + user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.get("/steam/:steamId", (req, res, next) => {
  const steamId = req.params.steamId;

  User.query()
    .findOne("steam_id", "=", steamId)
    .then((user) => {
      console.log("complete getUser");
      res.send(user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.get("/:id/with-games", (req, res, next) => {
  const userId = req.params.id;

  User.query()
    .findById(userId)
    .withGraphFetched("games")
    .then((user) => {
      console.log(user);
      res.send(user);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

module.exports = router;
