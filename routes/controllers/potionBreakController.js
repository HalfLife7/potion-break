const fs = require("fs");
const moment = require("moment");
const express = require("express");
const checkLogin = require("../../config/checkLoginMiddleware");

const router = express.Router();

const Game = require("../../models/game");
const Charity = require("../../models/charity");
const PotionBreak = require("../../models/potionBreak");
const UserGame = require("../../models/userGame");

// TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)

router.get("/potion-break/create/:appid", checkLogin, async (req, res) => {
  const appId = req.params.appid;

  const game = await Game.query().findById(appId);
  const charities = await Charity.query();

  const files = fs.readdirSync("public/images/hero/create-potion-break");
  const randomImage = files[Math.floor(Math.random() * files.length)];
  console.log(game);

  res.render("create-potion-break", {
    user: req.user,
    game,
    charities,
    image: randomImage,
  });
});

router.get("/potion-breaks/view/all", checkLogin, async (req, res) => {
  try {
    const potionBreakData = await PotionBreak.query()
      .select(
        "potion_breaks.id",
        "potion_breaks.start_date",
        "potion_breaks.end_date",
        "potion_breaks.user_id",
        "potion_breaks.game_id",
        "potion_breaks.charity_id",
        "potion_breaks.total_value",
        "potion_breaks.status",
        "potion_breaks.playtime_start"
      )
      .from("potion_breaks")
      .where("potion_breaks.user_id", "=", req.user.id)
      .join("games", "potion_breaks.game_id", "games.id")
      .select(
        "games.name AS game_name",
        "games.img_icon AS game_img_icon_url",
        "games.img_logo AS game_img_logo_url"
      )
      .join("charities", "potion_breaks.charity_id", "charities.id")
      .select(
        "charities.name AS charity_name",
        "charities.description AS charity_description",
        "charities.img_path AS charity_img_path"
      );

    potionBreakData.forEach(function (potionBreak) {
      potionBreak.playtime_start_hours = Math.floor(
        potionBreak.playtime_start / 60
      );
      potionBreak.formatted_start_date = moment(potionBreak.start_date).format(
        "dddd, MMMM Do YYYY"
      );
      potionBreak.formatted_end_date = moment(potionBreak.end_date).format(
        "dddd, MMMM Do YYYY"
      );
      potionBreak.playtime_start_minutes = potionBreak.playtime_start % 60;
      const start = moment(potionBreak.start_date);
      const end = moment(potionBreak.end_date);
      const today = moment();
      const daysLeft = end.diff(today, "days");
      const totalDays = end.diff(start, "days");
      let progressPercentage = (
        ((totalDays - daysLeft) / totalDays) *
        100
      ).toFixed(2);
      // set progress bar fill percentage
      if (
        progressPercentage < 0 ||
        progressPercentage > 100 ||
        daysLeft === 0
      ) {
        progressPercentage = 100;
      }
      if (today.diff(start, "days") === 0) {
        progressPercentage = 0;
      }
      // set progress bar colour
      if (potionBreak.status === "Ongoing") {
        potionBreak.progress_colour = "is-link";
      } else if (potionBreak.status === "Failure") {
        potionBreak.progress_colour = "is-danger";
      } else if (potionBreak.status === "Success") {
        potionBreak.progress_colour = "is-success";
      }
      potionBreak.days_left = end.diff(today, "days");
      potionBreak.total_days = end.diff(start, "days");
      potionBreak.progress_percentage = progressPercentage;
    });

    const files = fs.readdirSync("public/images/hero/view-all-potion-breaks");
    const randomImage = files[Math.floor(Math.random() * files.length)];

    console.log(potionBreakData);

    res.render("view-all-potion-breaks", {
      potionBreakData,
      image: randomImage,
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/potion-break-creation-success", async (req, res) => {
  try {
    const potionBreakData = req.body;
    console.log(potionBreakData);

    // conversion from UNIX timestamp to YYYY-MM-DD
    const formattedStartDate = moment
      .unix(potionBreakData.dateCreated)
      .format("YYYY-MM-DD");
    potionBreakData.formattedDate = formattedStartDate;

    const charityId = await Charity.query()
      .select("id")
      .where("name", "=", potionBreakData.charityName);

    console.log(charityId);
    console.log(charityId[0].id);

    const playtimeForever = await UserGame.query()
      .select("playtime_forever")
      .where("game_id", "=", potionBreakData.appId)
      .where("user_id", "=", req.user.id);

    console.log(playtimeForever);
    console.log(playtimeForever[0].playtime_forever);
    const insertPotionBreak = await PotionBreak.query().insert({
      start_date: potionBreakData.formattedDate,
      end_date: potionBreakData.endDate,
      user_id: req.user.id,
      game_id: potionBreakData.appId,
      total_value: potionBreakData.paymentAmount,
      charity_id: charityId[0].id,
      setup_intent_id: potionBreakData.setupIntentId,
      status: "Ongoing",
      playtime_start: playtimeForever[0].playtime_forever,
      stripe_payment_date_created: potionBreakData.dateCreated,
    });

    const updatePotionBreakStatus = UserGame.query()
      .where("game_id", "=", potionBreakData.appId)
      .where("user_id", "=", req.user.id)
      .patch({
        potion_break_active: "true",
      });

    res.redirect(`potion-break/create/${potionBreakData.appId}/success`);
  } catch (err) {
    console.error(err.message);
  }
});

router.get(
  "/potion-break/create/:appid/success",
  checkLogin,
  async (req, res) => {
    try {
      console.log("starting potion-break/create/:appid/success");

      const maxPotionBreakId = await PotionBreak.query()
        .max("id")
        .where("user_id", "=", req.user.id);
      console.log(maxPotionBreakId);
      const potionBreakData = await PotionBreak.query()
        .select(
          "potion_breaks.id",
          "potion_breaks.start_date",
          "potion_breaks.end_date",
          "potion_breaks.user_id",
          "potion_breaks.game_id",
          "potion_breaks.charity_id",
          "potion_breaks.total_value",
          "potion_breaks.status",
          "potion_breaks.playtime_start"
        )
        .from("potion_breaks")
        .where("potion_breaks.id", "=", maxPotionBreakId[0].max)
        .join("games", "potion_breaks.game_id", "games.id")
        .select(
          "games.name AS game_name",
          "games.img_icon AS game_img_icon_url",
          "games.img_logo AS game_img_logo_url"
        )
        .join("charities", "potion_breaks.charity_id", "charities.id")
        .select(
          "charities.name AS charity_name",
          "charities.description AS charity_description",
          "charities.img_path AS charity_img_path"
        )
        .then((data) => {
          return data[0];
        });
      console.log(potionBreakData);

      // convert unix time to this format - Thursday, July 23rd 2020
      potionBreakData.formatted_start_date = moment(
        potionBreakData.start_date
      ).format("dddd, MMMM Do YYYY");
      potionBreakData.formatted_end_date = moment(
        potionBreakData.end_date
      ).format("dddd, MMMM Do YYYY");
      // calculate duration of potion break
      const start = moment(potionBreakData.start_date);
      const end = moment(potionBreakData.end_date);
      potionBreakData.total_days = end.diff(start, "days");
      // convert total time played from minutes to hours:minutes
      potionBreakData.playtime_start_hours = Math.floor(
        potionBreakData.playtime_start / 60
      );
      potionBreakData.playtime_start_minutes =
        potionBreakData.playtime_start % 60;

      console.log(potionBreakData);

      const files = fs.readdirSync("public/images/hero/potion-break-success");
      const randomImage = files[Math.floor(Math.random() * files.length)];

      res.render("potion-break-create-success", {
        user: req.user,
        potionBreakData,
        image: randomImage,
      });
    } catch (err) {
      console.error(err.message);
    }
  }
);

// export routes up to routes.js
module.exports = router;
