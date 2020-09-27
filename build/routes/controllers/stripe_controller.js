"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var express = require("express");

var stripe = require("stripe")(process.env.STRIPE_SK_TEST);

var router = express.Router();

var User = require("../../../models/user");

router.get("/public-key", function (req, res) {
  res.send({
    publicKey: process.env.STRIPE_PK_TEST
  });
});
router.post("/create-stripe-customer", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req) {
    var user, newCustomer, updateUser;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return User.query().findById(req.user.id).select("stripe_customer_id");

          case 3:
            user = _context.sent;

            if (!(user.stripe_customer_id === null)) {
              _context.next = 13;
              break;
            }

            _context.next = 7;
            return stripe.customers.create({
              description: req.user.steam_id
            });

          case 7:
            newCustomer = _context.sent;
            _context.next = 10;
            return User.query().findById(req.user.id).patch({
              stripe_customer_id: newCustomer.id
            });

          case 10:
            updateUser = _context.sent;
            _context.next = 13;
            break;

          case 13:
            _context.next = 18;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0.message);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 15]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
router.post("/create-setup-intent", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var userStripeId, stripeCustomer, setupIntent;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return User.query().findById(req.user.id).select("stripe_customer_id");

          case 3:
            userStripeId = _context2.sent;
            _context2.next = 6;
            return stripe.customers.retrieve(userStripeId.stripe_customer_id);

          case 6:
            stripeCustomer = _context2.sent;
            _context2.next = 9;
            return stripe.setupIntents.create({
              customer: stripeCustomer.id
            });

          case 9:
            setupIntent = _context2.sent;
            res.send({
              setupIntent: setupIntent
            });
            _context2.next = 16;
            break;

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0.message);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 13]]);
  }));

  return function (_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}()); // export routes up to routes.js

module.exports = router;
//# sourceMappingURL=stripe_controller.js.map