var express = require("express");
var router = express.Router();
var passport = require("passport");
const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

router.get("/", function (req, res) {
    res.render("login");
});

router.get("/home", function (req, res) {
    console.log(req.user);
    userInfo = req.user._json;

    // axios get request to API to get game information

    try {
        Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
            params: {
                steamid: userInfo.steamid,
                key: process.env.STEAM_API_KEY,
                include_played_free_games: true,
                include_appinfo: true,
                format: 'json'
            }
        }).then((response) => {
            getOwnedGamesData = response.data.response;
            console.log(getOwnedGamesData)

            // get user's games played and hours played

            // only include games with more than 1 hour played

            // sort by most hours played to least hours played

            // store data of appid, playtime forever, playtime last 2 weeks

            res.render("home", {
                user: userInfo,
                userSteamData: getOwnedGamesData.games
            });
        }, (error) => {
            console.log(error);
        })
    } catch (err) {
        console.error(err);
    }



})
// export routes up to routes.js
module.exports = router;