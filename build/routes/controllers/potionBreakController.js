"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var fs = require("fs");

var format = require("date-fns/format");

var differenceInCalendarDays = require("date-fns/differenceInCalendarDays");

var fromUnixTime = require("date-fns/fromUnixTime");

var formatISO = require("date-fns/formatISO");

var express = require("express");

var checkLogin = require("../../config/checkLoginMiddleware");

var router = express.Router();

var Game = require("../../../models/game");

var Charity = require("../../../models/charity");

var PotionBreak = require("../../../models/potionBreak");

var UserGame = require("../../../models/userGame"); // TODO: ADD MANDATE PAGE - https://stripe.com/docs/payments/setup-intents#mandates (more information)


router.get("/potion-break/create/:appid", checkLogin, /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var appId, game, charities, files, randomImage;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            appId = req.params.appid;
            _context.next = 3;
            return Game.query().findById(appId);

          case 3:
            game = _context.sent;
            _context.next = 6;
            return Charity.query();

          case 6:
            charities = _context.sent;
            files = fs.readdirSync("public/images/hero/create-potion-break");
            randomImage = files[Math.floor(Math.random() * files.length)];
            res.render("create-potion-break", {
              user: req.user,
              game: game,
              charities: charities,
              image: randomImage
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get("/potion-breaks/view/all", checkLogin, /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var potionBreakData, _iterator, _step, potionBreak, start, end, today, daysLeft, totalDays, progressPercentage, files, randomImage;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return PotionBreak.query().select("potion_breaks.id", "potion_breaks.start_date", "potion_breaks.end_date", "potion_breaks.user_id", "potion_breaks.game_id", "potion_breaks.charity_id", "potion_breaks.total_value", "potion_breaks.status", "potion_breaks.playtime_start").from("potion_breaks").where("potion_breaks.user_id", "=", req.user.id).join("games", "potion_breaks.game_id", "games.id").select("games.name AS game_name", "games.img_icon AS game_img_icon_url", "games.img_logo AS game_img_logo_url").join("charities", "potion_breaks.charity_id", "charities.id").select("charities.name AS charity_name", "charities.description AS charity_description", "charities.img_path AS charity_img_path").orderBy("potion_breaks.start_date");

          case 3:
            potionBreakData = _context2.sent;
            _iterator = _createForOfIteratorHelper(potionBreakData);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                potionBreak = _step.value;
                potionBreak.playtime_start_hours = Math.floor(potionBreak.playtime_start / 60);
                potionBreak.formatted_start_date = formatISO(potionBreak.start_date, {
                  representation: "date"
                });
                potionBreak.formatted_end_date = formatISO(potionBreak.end_date, {
                  representation: "date"
                });
                potionBreak.playtime_start_minutes = potionBreak.playtime_start % 60;
                start = new Date(potionBreak.start_date);
                end = new Date(potionBreak.end_date);
                today = new Date();
                daysLeft = differenceInCalendarDays(end, today);
                totalDays = differenceInCalendarDays(end, start);
                progressPercentage = ((totalDays - daysLeft) / totalDays * 100).toFixed(2); // set progress bar fill percentage

                if (progressPercentage < 0 || progressPercentage > 100 || daysLeft === 0) {
                  progressPercentage = 100;
                }

                if (totalDays === 0) {
                  progressPercentage = 0;
                } // set progress bar colour


                if (potionBreak.status === "Ongoing") {
                  potionBreak.progress_colour = "is-link";
                } else if (potionBreak.status === "Failure") {
                  potionBreak.progress_colour = "is-danger";
                } else if (potionBreak.status === "Success") {
                  potionBreak.progress_colour = "is-success";
                }

                potionBreak.days_left = daysLeft;
                potionBreak.total_days = totalDays;
                potionBreak.progress_percentage = progressPercentage;
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            files = fs.readdirSync("public/images/hero/view-all-potion-breaks");
            randomImage = files[Math.floor(Math.random() * files.length)];
            res.render("view-all-potion-breaks", {
              potionBreakData: potionBreakData,
              image: randomImage
            });
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 11]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.post("/potion-break-creation-success", /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var potionBreakData, formattedStartDate, charityId, playtimeForever, insertPotionBreak, updatePotionBreakStatus;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            potionBreakData = req.body; // conversion from UNIX timestamp to YYYY-MM-DD

            formattedStartDate = format(fromUnixTime(potionBreakData.dateCreated), "yyyy-MM-dd");
            potionBreakData.formattedDate = formattedStartDate;
            _context3.next = 6;
            return Charity.query().select("id").where("name", "=", potionBreakData.charityName);

          case 6:
            charityId = _context3.sent;
            _context3.next = 9;
            return UserGame.query().select("playtime_forever").where("game_id", "=", potionBreakData.appId).where("user_id", "=", req.user.id);

          case 9:
            playtimeForever = _context3.sent;
            _context3.next = 12;
            return PotionBreak.query().insert({
              start_date: potionBreakData.formattedDate,
              end_date: potionBreakData.endDate,
              user_id: req.user.id,
              game_id: potionBreakData.appId,
              total_value: potionBreakData.paymentAmount,
              charity_id: charityId[0].id,
              setup_intent_id: potionBreakData.setupIntentId,
              status: "Ongoing",
              playtime_start: playtimeForever[0].playtime_forever,
              stripe_payment_date_created: potionBreakData.dateCreated
            });

          case 12:
            insertPotionBreak = _context3.sent;
            _context3.next = 15;
            return UserGame.query().where("game_id", "=", potionBreakData.appId).where("user_id", "=", req.user.id).patch({
              potion_break_active: "true"
            });

          case 15:
            updatePotionBreakStatus = _context3.sent;
            res.redirect("potion-break/create/".concat(potionBreakData.appId, "/success"));
            _context3.next = 22;
            break;

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](0);
            console.error(_context3.t0);

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 19]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
router.get("/potion-break/create/:appid/success", checkLogin, /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var maxPotionBreakId, potionBreakData, start, end, files, randomImage;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return PotionBreak.query().max("id").where("user_id", "=", req.user.id);

          case 3:
            maxPotionBreakId = _context4.sent;
            _context4.next = 6;
            return PotionBreak.query().select("potion_breaks.id", "potion_breaks.start_date", "potion_breaks.end_date", "potion_breaks.user_id", "potion_breaks.game_id", "potion_breaks.charity_id", "potion_breaks.total_value", "potion_breaks.status", "potion_breaks.playtime_start").from("potion_breaks").where("potion_breaks.id", "=", maxPotionBreakId[0].max).join("games", "potion_breaks.game_id", "games.id").select("games.name AS game_name", "games.img_icon AS game_img_icon_url", "games.img_logo AS game_img_logo_url").join("charities", "potion_breaks.charity_id", "charities.id").select("charities.name AS charity_name", "charities.description AS charity_description", "charities.img_path AS charity_img_path").then(function (data) {
              return data[0];
            });

          case 6:
            potionBreakData = _context4.sent;
            // convert unix time to this format - Thursday, July 23rd 2020
            potionBreakData.formatted_start_date = format(potionBreakData.start_date, "EEEE, MMMM do yyyy");
            potionBreakData.formatted_end_date = format(potionBreakData.end_date, "EEEE, MMMM do yyyy"); // calculate duration of potion break

            start = new Date(potionBreakData.start_date);
            end = new Date(potionBreakData.end_date);
            potionBreakData.total_days = differenceInCalendarDays(end, start); // convert total time played from minutes to hours:minutes

            potionBreakData.playtime_start_hours = Math.floor(potionBreakData.playtime_start / 60);
            potionBreakData.playtime_start_minutes = potionBreakData.playtime_start % 60;
            files = fs.readdirSync("public/images/hero/potion-break-success");
            randomImage = files[Math.floor(Math.random() * files.length)];
            res.render("potion-break-create-success", {
              user: req.user,
              potionBreakData: potionBreakData,
              image: randomImage
            });
            _context4.next = 22;
            break;

          case 19:
            _context4.prev = 19;
            _context4.t0 = _context4["catch"](0);
            console.error(_context4.t0);

          case 22:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 19]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); // export routes up to routes.js

module.exports = router;