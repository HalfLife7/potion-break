var express = require("express");

var router = express.Router();

/**
 * router manager, loads each controller in seperate files to keep things organized
 */
router.use("/auth", require("./auth.js"));
//router.use("/", require("./controllers/loginController.js"));
router.use("/", require("./controllers/homeController.js"));

// export these routes up to server.js
module.exports = router;
