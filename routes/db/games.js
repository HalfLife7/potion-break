import express from "express";

const router = express.Router();

const Game = require("../../models/game");

router.get("/:id", (req, res, next) => {
  const gameId = req.params.id;

  Game.query()
    .findById(gameId)
    .withGraphFetched("screenshots")
    .withGraphFetched("movies")
    .then((game) => {
      res.send(game);
    });
});

module.exports = router;
