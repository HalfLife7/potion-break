"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var fs = require("fs");

var format = require("date-fns/format");

var Axios = require("axios");

var express = require("express");

var checkLogin = require("../../config/checkLoginMiddleware");

var router = express.Router();

var User = require("../../../models/user");

var Game = require("../../../models/game");

var UserGame = require("../../../models/userGame"); // convert playtime from minutes to hours:minutes


function convertMinutesToHHMM(item) {
  var totalMinutes = item.playtime_forever;
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes - hours * 60;

  if (hours === 0) {
    item.total_time_played = "".concat(minutes, " minutes");
  } else {
    item.total_time_played = "".concat(hours, " hours and ").concat(minutes, " minutes");
  }
}

router.get("/game-library", checkLogin, /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var userInfo, files, randomImage, userGameData, _iterator, _step, game, ownedGames, dateToday, playedGames, _iterator2, _step2, _game, totalMinutesPlayed, _iterator3, _step3, _game2, updateUser, _iterator4, _step4, _game3, getGame, insertGame, updateGame, _iterator5, _step5, _game4, getUserGame, insertUserGame, updateUserGame, _userGameData, _iterator6, _step6, _game5;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // console.log(req.user);
            userInfo = req.user;
            files = fs.readdirSync("public/images/hero/game-library");
            randomImage = files[Math.floor(Math.random() * files.length)]; // get user info from DB if this isn't the user's first time visiting this page after loading

            if (!(req.user.first_load === false)) {
              _context.next = 14;
              break;
            }

            _context.next = 7;
            return UserGame.query().select("*").from("user_games").leftJoin("games", "user_games.game_id", "games.id").where("user_games.user_id", "=", req.user.id);

          case 7:
            userGameData = _context.sent;
            userGameData.sort(function (a, b) {
              return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
            });
            _iterator = _createForOfIteratorHelper(userGameData);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                game = _step.value;

                if (game.potion_break_active === "true") {
                  game.potion_break_active = "disabled";
                } else if (game.potion_break_active === "false") {
                  game.potion_break_active = null;
                }

                convertMinutesToHHMM(game);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            res.render("game-library", {
              user: req.user,
              userSteamData: userGameData,
              image: randomImage
            });
            _context.next = 93;
            break;

          case 14:
            _context.next = 16;
            return Axios({
              method: "get",
              url: "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
              params: {
                steamid: userInfo.steam_id,
                key: process.env.STEAM_API_KEY,
                include_played_free_games: true,
                include_appinfo: true,
                format: "json" // 'appids_filter[0]': 570,
                // 'appids_filter[1]': 730

              }
            }).then(function (response) {
              return response.data.response;
            });

          case 16:
            ownedGames = _context.sent;
            dateToday = format(new Date(), "yyyy-MM-dd"); // descending order in playtime

            ownedGames.games.sort(function (a, b) {
              return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
            }); // remove games with no playtime

            playedGames = ownedGames.games.filter(function (game) {
              return game.playtime_forever > 0;
            });
            _iterator2 = _createForOfIteratorHelper(playedGames);

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _game = _step2.value;
                convertMinutesToHHMM(_game);
              } // get some additional player stats
              // get total games owned

            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            userInfo.total_steam_games_owned = ownedGames.game_count; // get total games played

            userInfo.total_steam_games_played = Object.keys(playedGames).length;
            totalMinutesPlayed = 0; // get total minutes played

            _iterator3 = _createForOfIteratorHelper(playedGames);

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _game2 = _step3.value;
                totalMinutesPlayed += _game2.playtime_forever;
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            userInfo.total_minutes_played = totalMinutesPlayed;
            userInfo.total_time_played = "".concat(Math.floor(totalMinutesPlayed / 60), " hours and ").concat(totalMinutesPlayed - Math.floor(totalMinutesPlayed / 60) * 60, " minutes");
            _context.next = 31;
            return User.query().findOne("id", "=", req.user.id).patch({
              total_steam_games_owned: userInfo.total_steam_games_owned,
              total_steam_games_played: userInfo.total_steam_games_played
            });

          case 31:
            updateUser = _context.sent;
            _iterator4 = _createForOfIteratorHelper(playedGames);
            _context.prev = 33;

            _iterator4.s();

          case 35:
            if ((_step4 = _iterator4.n()).done) {
              _context.next = 51;
              break;
            }

            _game3 = _step4.value;
            _context.next = 39;
            return Game.query().findById(_game3.appid).withGraphFetched("screenshots").withGraphFetched("movies");

          case 39:
            getGame = _context.sent;

            if (!(getGame === undefined)) {
              _context.next = 46;
              break;
            }

            _context.next = 43;
            return Game.query().insert({
              id: _game3.appid,
              name: _game3.name,
              img_icon: _game3.img_icon_url,
              img_logo: _game3.img_logo_url,
              last_updated: dateToday
            });

          case 43:
            insertGame = _context.sent;
            _context.next = 49;
            break;

          case 46:
            _context.next = 48;
            return Game.query().findById(_game3.appid).patch({
              name: _game3.name,
              img_icon: _game3.img_icon_url,
              img_logo: _game3.img_logo_url
            });

          case 48:
            updateGame = _context.sent;

          case 49:
            _context.next = 35;
            break;

          case 51:
            _context.next = 56;
            break;

          case 53:
            _context.prev = 53;
            _context.t0 = _context["catch"](33);

            _iterator4.e(_context.t0);

          case 56:
            _context.prev = 56;

            _iterator4.f();

            return _context.finish(56);

          case 59:
            _iterator5 = _createForOfIteratorHelper(playedGames);
            _context.prev = 60;

            _iterator5.s();

          case 62:
            if ((_step5 = _iterator5.n()).done) {
              _context.next = 78;
              break;
            }

            _game4 = _step5.value;
            _context.next = 66;
            return UserGame.query().findById([req.user.id, _game4.appid]);

          case 66:
            getUserGame = _context.sent;

            if (!(getUserGame === undefined)) {
              _context.next = 73;
              break;
            }

            _context.next = 70;
            return UserGame.query().insert({
              user_id: req.user.id,
              game_id: _game4.appid,
              playtime_forever: _game4.playtime_forever
            });

          case 70:
            insertUserGame = _context.sent;
            _context.next = 76;
            break;

          case 73:
            _context.next = 75;
            return UserGame.query().findById([req.user.id, _game4.appid]).patch({
              playtime_forever: _game4.playtime_forever
            });

          case 75:
            updateUserGame = _context.sent;

          case 76:
            _context.next = 62;
            break;

          case 78:
            _context.next = 83;
            break;

          case 80:
            _context.prev = 80;
            _context.t1 = _context["catch"](60);

            _iterator5.e(_context.t1);

          case 83:
            _context.prev = 83;

            _iterator5.f();

            return _context.finish(83);

          case 86:
            _context.next = 88;
            return UserGame.query().select("*").from("user_games").leftJoin("games", "user_games.game_id", "games.id").where("user_games.user_id", "=", req.user.id);

          case 88:
            _userGameData = _context.sent;

            _userGameData.sort(function (a, b) {
              return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
            });

            _iterator6 = _createForOfIteratorHelper(_userGameData);

            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                _game5 = _step6.value;

                if (_game5.potion_break_active === "true") {
                  _game5.potion_break_active = "disabled";
                } else if (_game5.potion_break_active === "false") {
                  _game5.potion_break_active = null;
                }

                convertMinutesToHHMM(_game5);
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }

            res.render("game-library", {
              user: req.user,
              userSteamData: _userGameData,
              image: randomImage
            });

          case 93:
            _context.next = 98;
            break;

          case 95:
            _context.prev = 95;
            _context.t2 = _context["catch"](0);
            console.error(_context.t2.message);

          case 98:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 95], [33, 53, 56, 59], [60, 80, 83, 86]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); // export routes up to routes.js

module.exports = router;