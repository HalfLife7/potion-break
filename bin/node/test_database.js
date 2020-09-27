#! /app/bin/node

var format = require("date-fns/format");

const Game = require("../../../models/game");

async function testDatabase() {
  const dateToday = format(new Date(), "yyyy-MM-dd");
  console.log(dateToday);

  const dota = await Game.query()
    .findById(570)
    .withGraphFetched("screenshots")
    .withGraphFetched("movies");

  console.log(dota);
}

testDatabase();
process.exit();
