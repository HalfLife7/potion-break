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
      console.log("complete get game");
      res.send(game);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.post("/", (req, res, next) => {
  const game = req.body;
  let timestampNow = new Date().getTime();
  Game.query()
    .insert({
      id: game.appid,
      name: game.name,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
      last_updated: timestampNow,
    })
    .then((game) => {
      console.log("complete insert game");
      res.send(game);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

router.put("/:id", (req, res, next) => {
  const gameId = req.params.id;
  const game = req.body;

  Game.query()
    .findById(gameId)
    .patch({
      name: game.name,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
    })
    .then((game) => {
      console.log("complete update game");
      console.log(game);
      res.send("Successfully updated User ID: " + game);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

module.exports = router;
