"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fs = require("fs");

var express = require("express");

var checkLogin = require("../../config/checkLoginMiddleware");

var router = express.Router();

var checkLogin = require("../../config/checkLoginMiddleware.js");

var User = require("../../../models/user");

var UserGame = require("../../../models/userGame"); // middleware to check if logged in


router.get("/user-profile", checkLogin, /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var userData, userTotalMinutesPlayed, userTotalGamesPlayed, hours, minutes, files, randomImage;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return User.query().findById(req.user.id).select("id", "steam_persona_name", "steam_profile", "steam_id", "steam_avatar", "total_steam_games_owned", "total_steam_games_played", "name", "email");

          case 2:
            userData = _context.sent;
            _context.next = 5;
            return UserGame.query().sum("playtime_forever as total_minutes_played").where("user_id", "=", req.user.id);

          case 5:
            userTotalMinutesPlayed = _context.sent;
            _context.next = 8;
            return UserGame.query().count("game_id as total_games_played").where("user_id", "=", req.user.id);

          case 8:
            userTotalGamesPlayed = _context.sent;
            userData.total_minutes_played = userTotalMinutesPlayed[0].total_minutes_played;
            userData.total_games_played = userTotalGamesPlayed[0].total_games_played;
            hours = Math.floor(userData.total_minutes_played / 60);
            minutes = userData.total_minutes_played - hours * 60;

            if (hours === 0) {
              userData.total_time_played = "".concat(minutes, " minutes");
            } else {
              userData.total_time_played = "".concat(hours, " hours and ").concat(minutes, " minutes");
            }

            files = fs.readdirSync("public/images/hero/user-profile");
            randomImage = files[Math.floor(Math.random() * files.length)];
            res.render("user-profile", {
              user: userData,
              image: randomImage
            });

          case 17:
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
router.post("/update-user-profile", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var formData, updateUser;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            formData = req.body;
            _context2.next = 3;
            return User.query().findById(req.user.id).patch({
              name: formData.name,
              email: formData.email
            });

          case 3:
            updateUser = _context2.sent;
            req.user.name = formData.name;
            req.user.email = formData.email;
            res.redirect("/user-profile");

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); // export routes up to routes.js

module.exports = router;
//# sourceMappingURL=user_controller.js.map