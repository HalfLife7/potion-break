var express = require("express");
var router = express.Router();
const Axios = require("axios");
const response = require("express");


router.get("/user", function (req, res) {
  console.log("/////////////////////////////////////////////////////////////////////////////")
  console.log(req.user);
  userInfo = req.user;

  // axios get request to API to get game information
  Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
    params: {
      steamid: userInfo.steam_id,
      key: process.env.STEAM_API_KEY,
      include_played_free_games: true,
      include_appinfo: true,
      format: 'json'
      //'appids_filter[0]': 570,
      //'appids_filter[1]': 730

    }
  }).then((response) => {
    var getOwnedGamesData = response.data.response;
    console.log(getOwnedGamesData)

    // descending order in playtime
    getOwnedGamesData.games.sort(function (a, b) {
      return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
    })

    // remove games with no playtime
    let filteredGamesData = getOwnedGamesData.games.filter(function (game) {
      return game.playtime_forever > 0;
    })

    // convert playtime from minutes to hours:minutes
    function convertMinutesToHHMM(item, index) {
      totalMinutes = item.playtime_forever;
      var hours = Math.floor(totalMinutes / 60)
      var minutes = totalMinutes - (hours * 60)
      if (hours === 0) {
        item.totalTimePlayed = minutes + " minutes"
      } else {
        item.totalTimePlayed = hours + " hours and " + minutes + " minutes";
      }

    }

    filteredGamesData.forEach(convertMinutesToHHMM);

    // get some additional player stats
    // get total games owned
    userInfo.totalGamesOwned = getOwnedGamesData.game_count;
    // get total games played
    userInfo.totalGamesPlayed = Object.keys(filteredGamesData).length;

    var totalMinutesPlayed = 0;
    // get total minutes played
    function calculateSum(item, index) {
      totalMinutesPlayed += item.playtime_forever;
    }
    filteredGamesData.forEach(calculateSum);

    userInfo.totalMinutesPlayed = totalMinutesPlayed;
    userInfo.totalTimePlayed = (Math.floor(totalMinutesPlayed / 60) + " hours and " + (totalMinutesPlayed - (Math.floor(totalMinutesPlayed / 60)) * 60) + " minutes");

    console.log("here");
    res.render("user", {
      user: userInfo,
      userSteamData: filteredGamesData
    });
  }, (error) => {
    console.log(error);
  })
})

// export routes up to routes.js
module.exports = router;