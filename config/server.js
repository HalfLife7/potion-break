var express = require("express");
var session = require("express-session");
var path = require("path");
const mustacheExpress = require("mustache-express");
var config = require('./config.js');
var passport = require("passport");
var SteamStrategy = require("../lib/passport-steam/index.js").Strategy;

/**
 * SQLite setup
 */

const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database(config.DB_NAME, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
});

// create the table if it doesn't exist
db.serialize(function () {
    db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, salt TEXT)"
    );
});

// TODO: move this to .gitignore
var stripe = require("stripe")(config.STRIPE_SK_TEST);
var accountSid = config.STRIPE_ACCOUNT_SID;
var authToken = config.STRIPE_AUTH_TOKEN;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    console.log(obj);
    done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(
    new SteamStrategy({
            returnURL: "http://localhost:3000/auth/steam/return",
            realm: "http://localhost:3000/",
            apiKey: config.STEAM_API_KEY,
        },
        function (identifier, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                // To keep the example simple, the user's Steam profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Steam account with a user record in your database,
                // and return that user instead.
                profile.identifier = identifier;
                return done(null, profile);
            });
        }
    )
);

var app = express();

const bodyParser = require("body-parser");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// set view paths
const viewsPath = path.join(__dirname, "../views");
const viewsPages = path.join(__dirname, "../views/pages");

app.engine("mustache", mustacheExpress(viewsPath + "/partials", ".mustache"));
app.set("view engine", "mustache");
app.set("views", [viewsPath, viewsPages]);

// start session
app.use(
    session({
        secret: config.SESSION_SECRET,
        name: "potion-break-session",
        resave: false,
        saveUninitialized: true,
        secure: true,
    })
);

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// load routes from routes.js
var routes = require("../routes/routes.js");
app.use("/", routes);

var server = app.listen(3000, "localhost", function () {
    console.log("Server listening on port 3000");
});