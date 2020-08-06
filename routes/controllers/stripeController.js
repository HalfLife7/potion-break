var checkLogin = require("../../config/checkLoginMiddleware");
var express = require("express");
var router = express.Router();
var config = require("../../config/config.js");
var Promise = require("bluebird");
const AppDAO = require("../../db/dao.js");
const {
    join,
    resolve,
    reject
} = require("bluebird");
const dao = new AppDAO('./database.db');

const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

// stripe setup
var stripe = require("stripe")(config.STRIPE_SK_TEST);

router.get("/public-key", function (req, res) {
    res.send({
        publicKey: config.STRIPE_PK_TEST
    });
});

router.post("/create-stripe-customer", function async (req, res) {
    // Create or use an existing Customer to associate with the SetupIntent.
    // The PaymentMethod will be stored to this Customer for later use.
    var sql = `
    SELECT stripe_customer_id 
    FROM users 
    WHERE user_id = ( ? )
    `;
    var params = [req.user.user_id];
    let dbGetUserStripeId = dao.get(sql, params)
        .then((userData) => {
            // if nothing is returned, create a new customer and tie it to the user
            if (userData.stripe_customer_id === null) {
                // create customer
                return stripe.customers.create({
                    description: req.user.steam_id
                }).then((customer) => {
                    var sql = `
                    UPDATE users 
                    SET stripe_customer_id = ( ? ) 
                    WHERE user_id = ( ? )
                    `;
                    var params = [customer.id, req.user.user_id];
                    let dbUpdateUserStripeId = dao.run(sql, params);
                })
            } else {
                // do nothing if user already is a customer in stripe
                resolve("stripeUserAlreadyExists");
            }
        })
        .catch((err) => {
            console.error("Error: " + err);
        });
});

router.post("/create-setup-intent", function async (req, res) {
    // use an existing Customer to associate with the SetupIntent.
    // The PaymentMethod will be stored to this Customer for later use.

    var sql = `
    SELECT stripe_customer_id 
    FROM users 
    WHERE user_id = ( ? )
    `;
    var params = [req.user.user_id];
    let dbGetUserStripeId = dao.get(sql, params)
        .then((userData) => {
            console.log("dbGetUserStripeId");
            console.log(userData);
            return stripe.customers.retrieve(userData.stripe_customer_id);
        })
        .then((customer) => {
            console.log("stripe.customers.retrieve");
            console.log(customer);
            return stripe.setupIntents.create({
                customer: customer.id
            })
        })
        .then((setupIntent) => {
            console.log("stripe.setupIntents.create");
            console.log(setupIntent);
            res.send({
                setupIntent: setupIntent
            });
        })
        .catch((err) => {
            console.error("Error: " + err);
        })
});

// Webhook handler for asynchronous events.
router.post("/webhook", async function (req, res) {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];

        try {
            event = await stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === "setup_intent.created") {
        console.log(`🔔  A new SetupIntent is created. ${data.object.id}`);
    }

    if (eventType === "setup_intent.setup_failed") {
        console.log(`🔔  A SetupIntent has failed to set up a PaymentMethod.`);
    }

    if (eventType === "setup_intent.succeeded") {
        console.log(
            `🔔  A SetupIntent has successfully set up a PaymentMethod for future use.`
        );
    }

    if (eventType === "payment_method.attached") {
        console.log(
            `🔔  A PaymentMethod ${data.object.id} has successfully been saved to a Customer ${data.object.customer}.`
        );

        // At this point, associate the ID of the Customer object with your
        // own internal representation of a customer, if you have one.

        // Optional: update the Customer billing information with billing details from the PaymentMethod
        const customer = await stripe.customers.update(
            data.object.customer, {
                email: data.object.billing_details.email
            },
            function () {
                console.log(
                    `🔔  Customer successfully updated.`
                );
            }
        );

    }
    res.sendStatus(200);
});

// export routes up to routes.js
module.exports = router;