import express from "express";

const router = express.Router();

const UserGame = require("../../models/userGame");

router.get("/get", (req, res, next) => {
  const userId = req.query.userId;
  const gameId = req.query.gameId;

  UserGame.query()
    .findById([userId, gameId])
    .then((userGame) => {
      res.send(userGame);
    });
});

router.post("/insert", (req, res, next) => {
  const userGame = req.body;
  let timestampNow = new Date().getTime();
  UserGame.query().insert({
    user_id: userGame.user_id,
    game_id: userGame.game_id,
    playtime_forever: userGame.playtime_forever,
  });
});

router.put("/update", (req, res, next) => {
  const userId = req.query.userId;
  const gameId = req.query.gameId;

  UserGame.query()
    .findById([userId, gameId])
    .patch({
      playtime_forever: userGame.playtime_forever,
    })
    .then((userGame) => {
      UserGame;
      res.send("Successfully updated User ID/Game ID: " + userGame);
    });
});

module.exports = router;
