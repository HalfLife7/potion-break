const os = require("os");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
const mustacheExpress = require("mustache-express");
var config = require("./config.js");
var passport = require("passport");
var SteamStrategy = require("../lib/passport-steam/index.js").Strategy;
var Promise = require("bluebird");
const { join, resolve, reject } = require("bluebird");
require("dotenv").config();

const axios = require("axios").default;
const User = require("../models/user");

// TODO: update stripe API to use the newset version (currently using 2019-11-05, newest is 2020-03-02)
// TODO: create automated test cases

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(
  new SteamStrategy(
    {
      returnURL: "http://localhost:5000/auth/steam/return",
      realm: "http://localhost:5000/",
      apiKey: config.STEAM_API_KEY,
    },
    function (identifier, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        //console.log(profile._json);
        var userInfo = {
          personaname: profile._json.personaname,
          profileurl: profile._json.profileurl,
          steamid: profile._json.steamid,
          avatarfull: profile._json.avatarfull,
        };

        // To keep the example simple, the user's Steam profile is returned to
        // represent the logged-in user.
        // TODO: Add support/functionality for other platforms such as Blizzard's Battle.net
        // Associate the Steam account with a user record in your database,
        // and return that user instead in case they have other connections.
        function getUser() {
          return axios({
            method: "GET",
            url: `http://localhost:5000/db/users/steam/${userInfo.steamid}`,
          });
        }

        function insertUser() {
          return axios({
            method: "POST",
            url: `http://localhost:5000/db/users/new`,
            data: {
              steam_persona_name: userInfo.personaname,
              steam_profile: userInfo.profileurl,
              steam_id: userInfo.steamid,
              steam_avatar: userInfo.avatarfull,
            },
          });
        }

        function updateUser() {
          return axios({
            method: "PUT",
            url: `http://localhost:5000/db/users/update`,
            data: {
              steam_persona_name: userInfo.personaname,
              steam_profile: userInfo.profileurl,
              steam_id: userInfo.steamid,
              steam_avatar: userInfo.avatarfull,
            },
          });
        }

        // check if user exists
        getUser()
          .then((user) => {
            if (user.data === undefined) {
              // if user does not exist, insert new
              return insertUser();
            } else {
              // if user does exist, update
              return updateUser();
            }
          })
          .then((response) => {
            // get user data at the end
            return getUser();
          })
          .then((results) => {
            resolve(done(null, results.data));
          });
      });
    }
  )
);

var app = express();

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// parse application/json
app.use(bodyParser.json());

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
app.use(express.static(path.join(__dirname, "../public")));
// stripe webhook local
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// load routes
var routes = require("../routes/index.js");

app.use("/", routes);

var server = app.listen(process.env.WEB_PORT, "localhost", function () {
  console.log("Server listening on port " + process.env.WEB_PORT);
});
