const os = require('os');
var express = require("express");
var session = require("express-session");
var bodyParser = require('body-parser')
var path = require("path");
const mustacheExpress = require("mustache-express");
var config = require('./config.js');
var passport = require("passport");
var SteamStrategy = require("../lib/passport-steam/index.js").Strategy;
var db = require("./db.js");

// TODO: update stripe API to use the newset version (currently using 2019-11-05, newest is 2020-03-02)
// TODO: create automated test cases

// create the table if it doesn't exist
db.serialize(function () {
    // create tables
    db.run("CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, steam_persona_name TEXT, steam_profile_url TEXT, steam_id TEXT UNIQUE, steam_avatar text, name TEXT, email TEXT, stripe_customer_id TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS games (app_id INTEGER PRIMARY KEY, name TEXT, img_icon_url TEXT, img_logo_url TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS user_games_owned (app_id INTEGER, user_id INTEGER, playtime_forever INTEGER, PRIMARY KEY(app_id, user_id), FOREIGN KEY(app_id) REFERENCES games(app_id), FOREIGN KEY(user_id) REFERENCES users(user_id))");
    db.run("CREATE TABLE IF NOT EXISTS potion_breaks (potion_break_id INTEGER PRIMARY KEY AUTOINCREMENT, start_date TEXT, end_date TEXT, user_id INTEGER, app_id INTEGER, total_value INTEGER, charity_id INTEGER, setup_intent_id TEXT, status TEXT, playtime_start TEXT, playtime_end TEXT, payment_status TEXT, stripe_payment_date_created TEXT, FOREIGN KEY(app_id) REFERENCES games(app_id), FOREIGN KEY(user_id) REFERENCES users(user_id), FOREIGN KEY(charity_id) REFERENCES charities(charity_id))");
    db.run("CREATE TABLE IF NOT EXISTS charities (charity_id INTEGER PRIMARY KEY, name TEXT UNIQUE, description TEXT)");

    // TODO: get charity logos
    const charities = [{
            id: "1",
            name: "NPR",
            description: "NPR is an independent, nonprofit media organization that was founded on a mission to create a more informed public. Every day, NPR connects with millions of Americans on the air, online, and in person to explore the news, ideas, and what it means to be human."
        },
        {
            id: "2",
            name: "Nature Conservancy Canada",
            description: "The Nature Conservancy of Canada (NCC) is Canada's leading national land conservation organization. A private, non-profit organization, we partner with individuals, corporations, foundations, Indigenous communities and other non-profit organizations and governments at all levels to protect our most important natural treasures — the natural areas that sustain Canada’s plants and wildlife. We secure properties (through donation, purchase, conservation agreement and the relinquishment of other legal interests in land) and manage them for the long term."
        },
        {
            id: "3",
            name: "SPCA",
            description: "As Canada's federation of SPCAs and humane societies, Humane Canada™ advances the welfare of animals with a strong national voice, promoting the interests and concerns of animal welfare to government, policy makers, industry and public."
        },
        {
            id: "4",
            name: "WWF Canada",
            description: "World Wildlife Fund Canada is the country’s largest international conservation organization. Using the best scientific analysis and indigenous guidance, we work to conserve species at risk, protect threatened habitats, and address climate change. Our long-term vision is simple: to create a world where people and nature thrive."
        },
        {
            id: "5",
            name: "PBS",
            description: "PBS is a membership organization that, in partnership with its member stations, serves the American public with programming and services of the highest quality, using media to educate, inspire, entertain and express a diversity of perspectives."
        }
    ]


    // seed data into charities table if it is empty
    for (i = 0; i < charities.length; i++) {
        db.run("INSERT OR IGNORE INTO charities (charity_id, name, description) VALUES (?, ?, ?)", [charities[i].id, charities[i].name, charities[i].description], function (err) {
            if (err != null) {
                console.error(err);
            }
        });
    }
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
    new SteamStrategy({
            returnURL: "http://localhost:3000/auth/steam/return",
            realm: "http://localhost:3000/",
            apiKey: config.STEAM_API_KEY,
        },
        function (identifier, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                console.log(profile._json);
                var userInfo = {
                    personaname: profile._json.personaname,
                    profileurl: profile._json.profileurl,
                    steamid: profile._json.steamid,
                    avatarfull: profile._json.avatarfull
                };

                console.log(userInfo);

                // To keep the example simple, the user's Steam profile is returned to
                // represent the logged-in user. 
                // TODO: Add support/functionality for other platforms such as Blizzard's Battle.net
                // Associate the Steam account with a user record in your database,
                // and return that user instead in case they have other connections.

                // UPSERT user data from steam profile
                db.serialize(function () {
                    db.run("INSERT INTO users (steam_persona_name, steam_profile_url, steam_id, steam_avatar) VALUES (?,?,?,?) ON CONFLICT(steam_id) DO UPDATE SET steam_persona_name=excluded.steam_persona_name, steam_profile_url=excluded.steam_profile_url, steam_avatar=excluded.steam_avatar", [userInfo.personaname, userInfo.profileurl, userInfo.steamid, userInfo.avatarfull], function callback(err) {
                        if (err != null) {
                            console.log(err);
                        } else {
                            // return all user information (steam, email, bnet, etc.)
                            db.get("SELECT * FROM users WHERE steam_id = (?)", [userInfo.steamid], function callback(err, row) {
                                if (err != null) {
                                    console.err(err);
                                } else {
                                    console.log("HERE");
                                    console.log(row);
                                    results = row;
                                    return done(null, results);
                                }
                            })
                        }
                    });
                })
            });
        }
    )
);

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}))

// parse application/json
app.use(bodyParser.json())

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
app.use(express.static(path.join(__dirname, '../public')));
// stripe webhook local
app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        }
    })
);

// load routes
var routes = require("../routes/index.js");

app.use("/", routes);

var server = app.listen(3000, "localhost", function () {
    console.log("Server listening on port 3000");
});