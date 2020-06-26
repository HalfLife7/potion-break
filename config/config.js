require('dotenv').config();
var config = {
    WEB_PORT: process.env.WEB_PORT,
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    STRIPE_ACCOUNT_SID: process.env.STRIPE_ACCOUNT_SID,
    STRIPE_AUTH_TOKEN: process.env.STRIPE_AUTH_TOKEN,
    STRIPE_SK_TEST: process.env.STRIPE_SK_TEST,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DB_NAME: "database.db"
};
module.exports = config;