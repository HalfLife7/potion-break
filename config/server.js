const os = require('os');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const mustacheExpress = require('mustache-express');
var config = require('./config.js');
var passport = require('passport');
var SteamStrategy = require('../lib/passport-steam/index.js').Strategy;
var Promise = require('bluebird');
const { join, resolve, reject } = require('bluebird');

// db stuff
const AppDAO = require('../db/dao.js');
const CharityRepository = require('../db/charityRepository.js');
const GameRepository = require('../db/gameRepository.js');
const PotionBreakRepository = require('../db/potionBreakRepository.js');
const UserGamesRepository = require('../db/userGamesRepository.js');
const UserRepository = require('../db/userRepository.js');

// TODO: update stripe API to use the newset version (currently using 2019-11-05, newest is 2020-03-02)
// TODO: create automated test cases

function main() {
  const dao = new AppDAO('./database.db');
  const charityRepo = new CharityRepository(dao);
  const gameRepo = new GameRepository(dao);
  const potionBreakRepo = new PotionBreakRepository(dao);
  const userGamesRepo = new UserGamesRepository(dao);
  const userRepo = new UserRepository(dao);

  charityRepo
    .createTable()
    .then(() => gameRepo.createTable())
    .then(() => potionBreakRepo.createTable())
    .then(() => userGamesRepo.createTable())
    .then(() => userRepo.createTable())
    .then(() => {
      let charities = [
        {
          id: '1',
          name: 'NPR',
          description:
            'NPR is an independent, nonprofit media organization that was founded on a mission to create a more informed public. Every day, NPR connects with millions of Americans on the air, online, and in person to explore the news, ideas, and what it means to be human.',
          img_path: '/images/charities/npr.svg',
        },
        {
          id: '2',
          name: 'Nature Conservancy Canada',
          description:
            "The Nature Conservancy of Canada (NCC) is Canada's leading national land conservation organization. A private, non-profit organization, we partner with individuals, corporations, foundations, Indigenous communities and other non-profit organizations and governments at all levels to protect our most important natural treasures — the natural areas that sustain Canada’s plants and wildlife. We secure properties (through donation, purchase, conservation agreement and the relinquishment of other legal interests in land) and manage them for the long term.",
          img_path: '/images/charities/ncc.svg',
        },
        {
          id: '3',
          name: 'Ontario SPCA',
          description:
            'The Ontario SPCA and Humane Society is a registered charity, established in 1873. The Society and its network of communities facilitate and provide for province-wide leadership on matters relating to the prevention of cruelty to animals and the promotion of animal well-being. Offering a variety of mission-based programs, including community-based sheltering, animal wellness services, provincial animal transfers, shelter health & wellness, high-volume spay/neuter services, animal rescue, animal advocacy, Indigenous partnership programs and humane education, the Ontario SPCA is Ontario’s animal charity.',
          img_path: '/images/charities/spca.png',
        },
        {
          id: '4',
          name: 'WWF Canada',
          description:
            'World Wildlife Fund Canada is the country’s largest international conservation organization. Using the best scientific analysis and indigenous guidance, we work to conserve species at risk, protect threatened habitats, and address climate change. Our long-term vision is simple: to create a world where people and nature thrive.',
          img_path: '/images/charities/wwf.png',
        },
        {
          id: '5',
          name: 'PBS',
          description:
            'PBS is a membership organization that, in partnership with its member stations, serves the American public with programming and services of the highest quality, using media to educate, inspire, entertain and express a diversity of perspectives.',
          img_path: '/images/charities/pbs.svg',
        },
      ];

      return Promise.all(
        charities.map((charity) => {
          let { id, name, description, img_path } = charity;

          let sql = `
                INSERT OR IGNORE INTO charities (
                    charity_id, 
                    name, 
                    description, 
                    img_path) 
                    VALUES(?, ?, ?, ?)
                `;

          return dao.run(sql, [
            charity.id,
            charity.name,
            charity.description,
            charity.img_path,
          ]);
        })
      );
    })
    .then(() => {
      let games = [
        {
          id: '570',
        },
        {
          id: '435150',
        },
        {
          id: '546560',
        },
      ];

      return Promise.all(
        games.map((game) => {
          let { id } = game;

          let sql = `
                INSERT OR IGNORE INTO games (
                    app_id) 
                    VALUES( ? )
                `;

          return dao.run(sql, [game.id]);
        })
      );
    })
    .catch((err) => {
      console.error('Error: ' + err);
    });

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
        returnURL: 'http://localhost:3000/auth/steam/return',
        realm: 'http://localhost:3000/',
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
  const viewsPath = path.join(__dirname, '../views');
  const viewsPages = path.join(__dirname, '../views/pages');

  app.engine('mustache', mustacheExpress(viewsPath + '/partials', '.mustache'));
  app.set('view engine', 'mustache');
  app.set('views', [viewsPath, viewsPages]);

  // start session
  app.use(
    session({
      secret: config.SESSION_SECRET,
      name: 'potion-break-session',
      resave: false,
      saveUninitialized: true,
      secure: true,
    })
  );

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, '../public')));
  // stripe webhook local
  app.use(
    express.json({
      // We need the raw body to verify webhook signatures.
      // Let's compute it only when hitting the Stripe webhook endpoint.
      verify: function (req, res, buf) {
        if (req.originalUrl.startsWith('/webhook')) {
          req.rawBody = buf.toString();
        }
      },
    })
  );

  // load routes
  var routes = require('../routes/index.js');

  app.use('/', routes);

  var server = app.listen(process.env.WEB_PORT, 'localhost', function () {
    console.log('Server listening on port ' + process.env.WEB_PORT);
  });
}

main();
