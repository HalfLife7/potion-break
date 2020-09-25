"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var express = require("express");

var format = require("date-fns/format");

var router = express.Router();

var Axios = require("axios");

var stripe = require("stripe")(process.env.STRIPE_SK_TEST);

var _require = require("cron"),
    CronJob = _require.CronJob;

var Bottleneck = require("bottleneck/es5");

var PotionBreak = require("../../../models/potionBreak");

var UserGame = require("../../../models/userGame");

var Game = require("../../../models/game");

var GameScreenshot = require("../../../models/gameScreenshot");

var GameMovie = require("../../../models/gameMovie.js"); //  0 0 * * * - at midnight every night
// 1-59/2 * * * * - odd minute for testing


var potionBreakDailyCheck = new CronJob("1-59/2 * * * *", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var dateToday, potionBreakData, userGameData, _iterator, _step, _step$value, i, potionBreak, userPreviousPlaytime, userCurrentPlaytime, updatePotionBreakFailure, updatePotionBreakSuccess, updateUserGame, successfulPotionBreaks, setupIntents, _iterator2, _step2, setupIntent;

  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          // get users who have potion break ending that night
          dateToday = format(new Date(), "yyyy-MM-dd");
          _context3.next = 4;
          return PotionBreak.query().select("potion_breaks.*").from("potion_breaks").where("potion_breaks.end_date", "=", dateToday).where("potion_breaks.status", "=", "Ongoing").join("users", "potion_breaks.user_id", "users.id").select("users.steam_id", "users.stripe_customer_id");

        case 4:
          potionBreakData = _context3.sent;
          _context3.next = 7;
          return Promise.all(potionBreakData.map( /*#__PURE__*/function () {
            var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(potionBreak) {
              return _regenerator["default"].wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return Axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
                        params: {
                          steamid: potionBreak.steam_id,
                          key: process.env.STEAM_API_KEY,
                          include_played_free_games: true,
                          include_appinfo: true,
                          format: "json",
                          "appids_filter[0]": potionBreak.game_id
                        }
                      }).then(function (response) {
                        return response.data.response.games[0];
                      });

                    case 2:
                      return _context.abrupt("return", _context.sent);

                    case 3:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function (_x) {
              return _ref2.apply(this, arguments);
            };
          }()));

        case 7:
          userGameData = _context3.sent;
          // https://thecodebarbarian.com/for-vs-for-each-vs-for-in-vs-for-of-in-javascript
          _iterator = _createForOfIteratorHelper(potionBreakData.entries());
          _context3.prev = 9;

          _iterator.s();

        case 11:
          if ((_step = _iterator.n()).done) {
            _context3.next = 29;
            break;
          }

          _step$value = (0, _slicedToArray2["default"])(_step.value, 2), i = _step$value[0], potionBreak = _step$value[1];
          userPreviousPlaytime = potionBreak.playtime_start;
          userCurrentPlaytime = userGameData[i].playtime_forever; // if user played (increase playtime) -> fail potion break

          if (!(userPreviousPlaytime < userCurrentPlaytime)) {
            _context3.next = 21;
            break;
          }

          _context3.next = 18;
          return PotionBreak.query().where("id", "=", potionBreak.id).patch({
            status: "Failure",
            playtime_end: userCurrentPlaytime,
            payment_status: "Unpaid"
          });

        case 18:
          updatePotionBreakFailure = _context3.sent;
          _context3.next = 24;
          break;

        case 21:
          _context3.next = 23;
          return PotionBreak.query().where("id", "=", potionBreak.id).patch({
            status: "Success",
            playtime_end: userCurrentPlaytime,
            payment_status: "N/A"
          });

        case 23:
          updatePotionBreakSuccess = _context3.sent;

        case 24:
          _context3.next = 26;
          return UserGame.query().where("game_id", "=", potionBreak.game_id).where("user_id", "=", potionBreak.user_id).patch({
            potion_break_active: "false"
          });

        case 26:
          updateUserGame = _context3.sent;

        case 27:
          _context3.next = 11;
          break;

        case 29:
          _context3.next = 34;
          break;

        case 31:
          _context3.prev = 31;
          _context3.t0 = _context3["catch"](9);

          _iterator.e(_context3.t0);

        case 34:
          _context3.prev = 34;

          _iterator.f();

          return _context3.finish(34);

        case 37:
          _context3.next = 39;
          return PotionBreak.query().select("potion_breaks.*").from("potion_breaks").where("potion_breaks.end_date", "=", dateToday).where("potion_breaks.status", "=", "Success").join("users", "potion_breaks.user_id", "users.id").select("users.steam_id", "users.stripe_customer_id");

        case 39:
          successfulPotionBreaks = _context3.sent;
          _context3.next = 42;
          return Promise.all(successfulPotionBreaks.map( /*#__PURE__*/function () {
            var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(potionBreak) {
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return stripe.setupIntents.retrieve(potionBreak.setup_intent_id);

                    case 2:
                      return _context2.abrupt("return", _context2.sent);

                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            }));

            return function (_x2) {
              return _ref3.apply(this, arguments);
            };
          }()));

        case 42:
          setupIntents = _context3.sent;
          // remove the payment methods tied to the setupIntents
          // no longer need to charge them since the potion break was successful
          _iterator2 = _createForOfIteratorHelper(setupIntents);
          _context3.prev = 44;

          _iterator2.s();

        case 46:
          if ((_step2 = _iterator2.n()).done) {
            _context3.next = 52;
            break;
          }

          setupIntent = _step2.value;
          _context3.next = 50;
          return stripe.paymentMethods.detach(setupIntent.payment_method);

        case 50:
          _context3.next = 46;
          break;

        case 52:
          _context3.next = 57;
          break;

        case 54:
          _context3.prev = 54;
          _context3.t1 = _context3["catch"](44);

          _iterator2.e(_context3.t1);

        case 57:
          _context3.prev = 57;

          _iterator2.f();

          return _context3.finish(57);

        case 60:
          _context3.next = 65;
          break;

        case 62:
          _context3.prev = 62;
          _context3.t2 = _context3["catch"](0);
          console.error(_context3.t2.message);

        case 65:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, null, [[0, 62], [9, 31, 34, 37], [44, 54, 57, 60]]);
}))); // 5 0 * * * - at 12:05 every night
// */2 * * * * - even minutes for testing

var stripePaymentDailyCheck = new CronJob("*/2 * * * *", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
  var unpaidPotionBreaks, setupIntents, _iterator3, _step3, _step3$value, i, setupIntent, updatePaymentStatus;

  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return PotionBreak.query().select("potion_breaks.*").from("potion_breaks").where("potion_breaks.status", "=", "Failure").where("potion_breaks.payment_status", "=", "Unpaid").join("users", "potion_breaks.user_id", "users.id").select("users.steam_id", "users.stripe_customer_id");

        case 3:
          unpaidPotionBreaks = _context5.sent;
          _context5.next = 6;
          return Promise.all(unpaidPotionBreaks.map( /*#__PURE__*/function () {
            var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(potionBreak) {
              return _regenerator["default"].wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      potionBreak.total_value *= 100;
                      _context4.next = 3;
                      return stripe.setupIntents.retrieve(potionBreak.setup_intent_id);

                    case 3:
                      return _context4.abrupt("return", _context4.sent);

                    case 4:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
            }));

            return function (_x3) {
              return _ref5.apply(this, arguments);
            };
          }()));

        case 6:
          setupIntents = _context5.sent;
          _iterator3 = _createForOfIteratorHelper(setupIntents.entries());
          _context5.prev = 8;

          _iterator3.s();

        case 10:
          if ((_step3 = _iterator3.n()).done) {
            _context5.next = 23;
            break;
          }

          _step3$value = (0, _slicedToArray2["default"])(_step3.value, 2), i = _step3$value[0], setupIntent = _step3$value[1];
          console.log(setupIntent);
          console.log(unpaidPotionBreaks[i]);
          _context5.next = 16;
          return stripe.paymentIntents.create({
            amount: unpaidPotionBreaks[i].total_value,
            currency: "cad",
            payment_method_types: ["card"],
            customer: unpaidPotionBreaks[i].stripe_customer_id,
            payment_method: setupIntent.payment_method,
            off_session: true,
            confirm: true,
            error_on_requires_action: true // , mandate: true (TODO: NEED TO ADD)
            // , receipt_email: potionBreak[i].user_email
            // , on_behalf_of: USED FOR STRIPE CONNECT

          });

        case 16:
          _context5.next = 18;
          return stripe.paymentMethods.detach(setupIntent.payment_method);

        case 18:
          _context5.next = 20;
          return PotionBreak.query().where("setup_intent_id", "=", setupIntent.id).patch({
            payment_status: "Paid"
          });

        case 20:
          updatePaymentStatus = _context5.sent;

        case 21:
          _context5.next = 10;
          break;

        case 23:
          _context5.next = 28;
          break;

        case 25:
          _context5.prev = 25;
          _context5.t0 = _context5["catch"](8);

          _iterator3.e(_context5.t0);

        case 28:
          _context5.prev = 28;

          _iterator3.f();

          return _context5.finish(28);

        case 31:
          _context5.next = 36;
          break;

        case 33:
          _context5.prev = 33;
          _context5.t1 = _context5["catch"](0);
          console.error(_context5.t1.message);

        case 36:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, null, [[0, 33], [8, 25, 28, 31]]);
}))); // run everyday at 1:00am

var steamDataUpdate = new CronJob("0 1 * * *", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
  var gamesData, limiter, steamGameData, dateToday, _iterator4, _step4, _game$screenshots, _game$movies, game, updateGame, _iterator5, _step5, screenshot, checkScreenshot, _iterator6, _step6, movie, checkMovie, _movie$webm, _movie$webm2, _movie$mp, _movie$mp2, _movie$webm3, _movie$webm4, _movie$mp3, _movie$mp4;

  return _regenerator["default"].wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return Game.query().select("id", "name");

        case 2:
          gamesData = _context7.sent;
          // use bottleneck's limiter to throttle api calls to 1/sec (1000ms)
          limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 1000
          });
          _context7.next = 6;
          return Promise.all(gamesData.map( /*#__PURE__*/function () {
            var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(game) {
              return _regenerator["default"].wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.next = 2;
                      return limiter.schedule(function () {
                        return Axios.get("https://store.steampowered.com/api/appdetails", {
                          params: {
                            appids: game.id,
                            format: "json"
                          }
                        }).then(function (response) {
                          var timeNow = format(new Date());
                          console.log("".concat(game.name, " - ").concat(game.id, " - ").concat(timeNow)); // fix for games that cannot be queried by the store.steampowered api (such as dead island - 91310)

                          if (response.data[game.id].data === undefined) {
                            game.steam_appid = game.id;
                            return game;
                          } else {
                            return response.data[game.id].data;
                          }
                        });
                      });

                    case 2:
                      return _context6.abrupt("return", _context6.sent);

                    case 3:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6);
            }));

            return function (_x4) {
              return _ref7.apply(this, arguments);
            };
          }()));

        case 6:
          steamGameData = _context7.sent;
          dateToday = format(new Date(), "yyyy-MM-dd");
          _iterator4 = _createForOfIteratorHelper(steamGameData);
          _context7.prev = 9;

          _iterator4.s();

        case 11:
          if ((_step4 = _iterator4.n()).done) {
            _context7.next = 70;
            break;
          }

          game = _step4.value;
          _context7.next = 15;
          return Game.query().where("id", "=", game.steam_appid).patch({
            header_image: game === null || game === void 0 ? void 0 : game.header_image,
            last_updated: dateToday
          });

        case 15:
          updateGame = _context7.sent;

          if (!((game === null || game === void 0 ? void 0 : (_game$screenshots = game.screenshots) === null || _game$screenshots === void 0 ? void 0 : _game$screenshots.length) !== 0 && game.screenshots)) {
            _context7.next = 42;
            break;
          }

          _iterator5 = _createForOfIteratorHelper(game.screenshots);
          _context7.prev = 18;

          _iterator5.s();

        case 20:
          if ((_step5 = _iterator5.n()).done) {
            _context7.next = 34;
            break;
          }

          screenshot = _step5.value;
          _context7.next = 24;
          return GameScreenshot.query().findById([game.steam_appid, screenshot.id]);

        case 24:
          checkScreenshot = _context7.sent;

          if (!(checkScreenshot === undefined)) {
            _context7.next = 30;
            break;
          }

          _context7.next = 28;
          return GameScreenshot.query().insert({
            game_id: game.steam_appid,
            id: screenshot.id,
            path_thumbnail: screenshot.path_thumbnail,
            path_full: screenshot.path_full
          });

        case 28:
          _context7.next = 32;
          break;

        case 30:
          _context7.next = 32;
          return GameScreenshot.query().findById([game.steam_appid, screenshot.id]).patch({
            path_thumbnail: screenshot === null || screenshot === void 0 ? void 0 : screenshot.path_thumbnail,
            path_full: screenshot === null || screenshot === void 0 ? void 0 : screenshot.path_full
          });

        case 32:
          _context7.next = 20;
          break;

        case 34:
          _context7.next = 39;
          break;

        case 36:
          _context7.prev = 36;
          _context7.t0 = _context7["catch"](18);

          _iterator5.e(_context7.t0);

        case 39:
          _context7.prev = 39;

          _iterator5.f();

          return _context7.finish(39);

        case 42:
          if (!((game === null || game === void 0 ? void 0 : (_game$movies = game.movies) === null || _game$movies === void 0 ? void 0 : _game$movies.length) !== 0 && game.movies)) {
            _context7.next = 68;
            break;
          }

          _iterator6 = _createForOfIteratorHelper(game.movies);
          _context7.prev = 44;

          _iterator6.s();

        case 46:
          if ((_step6 = _iterator6.n()).done) {
            _context7.next = 60;
            break;
          }

          movie = _step6.value;
          _context7.next = 50;
          return GameMovie.query().findById([game.steam_appid, movie.id]);

        case 50:
          checkMovie = _context7.sent;

          if (!(checkMovie === undefined)) {
            _context7.next = 56;
            break;
          }

          _context7.next = 54;
          return GameMovie.query().insert({
            game_id: game.steam_appid,
            id: movie.id,
            name: movie === null || movie === void 0 ? void 0 : movie.name,
            thumbnail: movie === null || movie === void 0 ? void 0 : movie.thumbnail,
            webm_480: movie === null || movie === void 0 ? void 0 : (_movie$webm = movie.webm) === null || _movie$webm === void 0 ? void 0 : _movie$webm["480"],
            webm_max: movie === null || movie === void 0 ? void 0 : (_movie$webm2 = movie.webm) === null || _movie$webm2 === void 0 ? void 0 : _movie$webm2["max"],
            mp4_480: movie === null || movie === void 0 ? void 0 : (_movie$mp = movie.mp4) === null || _movie$mp === void 0 ? void 0 : _movie$mp["480"],
            mp4_max: movie === null || movie === void 0 ? void 0 : (_movie$mp2 = movie.mp4) === null || _movie$mp2 === void 0 ? void 0 : _movie$mp2["max"]
          });

        case 54:
          _context7.next = 58;
          break;

        case 56:
          _context7.next = 58;
          return GameMovie.query().findById([game.steam_appid, movie.id]).patch({
            name: movie === null || movie === void 0 ? void 0 : movie.name,
            thumbnail: movie === null || movie === void 0 ? void 0 : movie.thumbnail,
            webm_480: movie === null || movie === void 0 ? void 0 : (_movie$webm3 = movie.webm) === null || _movie$webm3 === void 0 ? void 0 : _movie$webm3["480"],
            webm_max: movie === null || movie === void 0 ? void 0 : (_movie$webm4 = movie.webm) === null || _movie$webm4 === void 0 ? void 0 : _movie$webm4["max"],
            mp4_480: movie === null || movie === void 0 ? void 0 : (_movie$mp3 = movie.mp4) === null || _movie$mp3 === void 0 ? void 0 : _movie$mp3["480"],
            mp4_max: movie === null || movie === void 0 ? void 0 : (_movie$mp4 = movie.mp4) === null || _movie$mp4 === void 0 ? void 0 : _movie$mp4["max"]
          });

        case 58:
          _context7.next = 46;
          break;

        case 60:
          _context7.next = 65;
          break;

        case 62:
          _context7.prev = 62;
          _context7.t1 = _context7["catch"](44);

          _iterator6.e(_context7.t1);

        case 65:
          _context7.prev = 65;

          _iterator6.f();

          return _context7.finish(65);

        case 68:
          _context7.next = 11;
          break;

        case 70:
          _context7.next = 75;
          break;

        case 72:
          _context7.prev = 72;
          _context7.t2 = _context7["catch"](9);

          _iterator4.e(_context7.t2);

        case 75:
          _context7.prev = 75;

          _iterator4.f();

          return _context7.finish(75);

        case 78:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7, null, [[9, 72, 75, 78], [18, 36, 39, 42], [44, 62, 65, 68]]);
}))); // start cronjobs
// potionBreakDailyCheck.start();
// stripePaymentDailyCheck.start();
// steamDataUpdate.start();
// export routes up to routes.js

module.exports = router;
//# sourceMappingURL=cronController.js.map