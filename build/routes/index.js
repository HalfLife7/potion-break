"use strict";

var express = require("express");

var router = express.Router();
/**
 * router manager, loads each controller in seperate files to keep things organized
 */

router.use("/auth", require("./controllers/authentication_controller.js"));
router.use("/", require("./controllers/home_controller.js"));
router.use("/", require("./controllers/game_library_controller.js"));
router.use("/", require("./controllers/potion_break_controller.js"));
router.use("/", require("./controllers/stripe_controller.js"));
router.use("/", require("./controllers/cron_controller.js"));
router.use("/", require("./controllers/user_controller.js")); // export these routes up to server.js

module.exports = router;
//# sourceMappingURL=index.js.map