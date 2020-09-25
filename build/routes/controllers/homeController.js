"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var express = require("express");

var router = express.Router();

var checkLogin = require("../../config/checkLoginMiddleware.js");

var Game = require("../../../models/game");

var Charity = require("../../../models/charity"); // middleware to check if logged in


router.get("/", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var dota, halflife, divinity, charities;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!req.user) {
              _context.next = 5;
              break;
            }

            res.redirect("/game-library");
            _context.next = 18;
            break;

          case 5:
            _context.next = 7;
            return Game.query().findById(570).withGraphFetched("screenshots").withGraphFetched("movies");

          case 7:
            dota = _context.sent;
            _context.next = 10;
            return Game.query().findById(435150).withGraphFetched("screenshots").withGraphFetched("movies");

          case 10:
            halflife = _context.sent;
            _context.next = 13;
            return Game.query().findById(546560).withGraphFetched("screenshots").withGraphFetched("movies");

          case 13:
            divinity = _context.sent;
            _context.next = 16;
            return Charity.query().findByIds([1, 2, 5]);

          case 16:
            charities = _context.sent;
            res.render("home", {
              dotaData: dota,
              halflifeData: halflife,
              divinityData: divinity,
              charityData: charities
            });

          case 18:
            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0.message);

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 20]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get("/login", checkLogin, function (req, res) {
  res.render("login");
}); // export routes up to routes.js

module.exports = router;