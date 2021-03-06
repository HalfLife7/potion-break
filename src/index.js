// .env workaround for heroku
// https:stackoverflow.com/questions/59759085/heroku-failed-to-load-env
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const bodyParser = require("body-parser");
const path = require("path");
const mustacheExpress = require("mustache-express");
const passport = require("passport");
const SteamStrategy = require("../lib/passport-steam/index.js").Strategy;

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

const returnURL = `${process.env.BASE_URL}/auth/steam/return`;
const realm = process.env.BASE_URL;

passport.use(
  new SteamStrategy(
    {
      returnURL,
      realm,
      apiKey: process.env.STEAM_API_KEY,
    },
    function (identifier, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // console.log(profile._json);
        const userInfo = {
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
          return User.query()
            .findOne("steam_id", "=", userInfo.steamid)
            .then((user) => {
              return user;
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function insertUser() {
          return User.query()
            .insert({
              steam_persona_name: userInfo.personaname,
              steam_profile: userInfo.profileurl,
              steam_id: userInfo.steamid,
              steam_avatar: userInfo.avatarfull,
            })
            .then((user) => {
              return user;
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        function updateUser() {
          return User.query()
            .findOne("steam_id", "=", userInfo.steamid)
            .patch({
              steam_persona_name: userInfo.personaname,
              steam_profile: userInfo.profileurl,
              steam_avatar: userInfo.avatarfull,
            })
            .then((user) => {
              return `Successfully updated User ID: ${user}`;
            })
            .catch((err) => {
              console.error(err.message);
            });
        }

        // check if user exists
        getUser()
          .then((user) => {
            if (user === undefined) {
              // if user does not exist, insert new
              return insertUser();
            }
            // if user does exist, update
            return updateUser();
          })
          .then(() => {
            // get user data at the end
            return getUser();
          })
          .then((results) => {
            return done(null, results);
          });
      });
    }
  )
);

const app = express();

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

app.engine("mustache", mustacheExpress(`${viewsPath}/partials`, ".mustache"));
app.set("view engine", "mustache");
app.set("views", [viewsPath, viewsPages]);

// app.enable("trust proxy");

// start session
app.use(
  session({
    cookie: { maxAge: 86400000 },
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET,
  })
);

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "../public")));

// load routes
const routes = require("./routes/index");

app.use("/", routes);
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
