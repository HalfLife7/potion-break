import util from "util";

const environment = process.env.NODE_ENV || "development";
console.log("environment: " + environment);
const config = require("../knexfile")[environment];

console.log(util.inspect(config, false, null, true));

module.exports = require("knex")(config);
