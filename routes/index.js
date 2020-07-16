var express = require("express");

var router = express.Router();

/**
 * router manager, loads each controller in seperate files to keep things organized
 */

router.use("/auth", require("./controllers/authenticationController.js"));
router.use("/", require("./controllers/homeController.js"));
router.use("/", require("./controllers/gameLibraryController.js"));
router.use("/", require("./controllers/potionBreakController.js"));
router.use("/", require("./controllers/stripeController.js"));
router.use("/", require("./controllers/cronController.js"));

// TODO: setup routes for potion breaks

// export these routes up to server.js
module.exports = router;