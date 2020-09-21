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

// db stuff
const AppDAO = require("../db.bak/dao.js");
const CharityRepository = require("../db.bak/charityRepository.js");
const GameRepository = require("../db.bak/gameRepository.js");
const PotionBreakRepository = require("../db.bak/potionBreakRepository.js");
const UserGamesRepository = require("../db.bak/userGamesRepository.js");
const UserRepository = require("../db.bak/userRepository.js");

// TODO: update stripe API to use the newset version (currently using 2019-11-05, newest is 2020-03-02)
// TODO: create automated test cases

function main() {
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

          // UPSERT user data from steam profile
          let sql = `
                    INSERT INTO users (
                        steam_persona_name, 
                        steam_profile_url, 
                        steam_id, 
                        steam_avatar) 
                        VALUES (?, ?, ?, ?) 
                        ON CONFLICT (steam_id) DO UPDATE SET 
                        steam_persona_name = excluded.steam_persona_name, 
                        steam_profile_url = excluded.steam_profile_url, 
                        steam_avatar = excluded.steam_avatar
                    `;
          let params = [
            userInfo.personaname,
            userInfo.profileurl,
            userInfo.steamid,
            userInfo.avatarfull,
          ];

          dao
            .run(sql, params)
            .then(() => {
              var sql = `
                            SELECT * FROM users 
                            WHERE steam_id = ( ? )
                            `;
              var params = [userInfo.steamid];
              return dao.get(sql, params);
            })
            .then((results) => {
              resolve(done(null, results));
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
}

main();
