var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");
var currency = require("currency.js");
var bcrypt = require('bcryptjs');

const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

// stripe setup
var stripe = require("stripe")(config.STRIPE_SK_TEST);
var accountSid = config.STRIPE_ACCOUNT_SID;
var authToken = config.STRIPE_AUTH_TOKEN;

// get user payment information using stripe
router.post('/create-payment-intent', async function (req, res) {
    console.log("BEGIN CREATE PAYMENT INTENT")
    console.log(req.user);
    const potionBreakDetails = req.user.potionBreakDetails;
    console.log(potionBreakDetails);

    db.serialize(function () {
        db.run("UPDATE user SET name = (?), email = (?) WHERE user_id = (?)", [req.user.name, req.user.email, req.user.user_id], function (err) {
            if (err != null) {
                console.err(err);
            } else {
                let currencyType = "cad";
                let orderAmount = currency(potionBreakDetails.amount).intValue;
                console.log(orderAmount);

                // Create a PaymentIntent with the order amount and currency
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: orderAmount,
                    currency: currencyType,
                    capture_method: 'manual'
                });

                console.log("SENDING PAYMENT INTENT")
                // Send publishable key and PaymentIntent details to client
                res.send({
                    publishableKey: process.env.STRIPE_PK_TEST,
                    clientSecret: paymentIntent.client_secret
                });
            }
        })
    })
})

router.post('/send-payment-intent', function (req, res) {
    console.log("BEGIN SEND PAYMENT INTENT");
    const paymentIntent = req.body;
    console.log(paymentIntent);
    // store date time object as UNIX timestamp - https://stackoverflow.com/questions/11893083/convert-normal-date-to-unix-timestamp
    let endDate = Math.floor(req.user.potionBreakDetails.endDate.getTime() / 1000);

    // encrypt client secret using bcrypt
    var salt = bcrypt.genSaltSync(10);
    var clientSecretHash = bcrypt.hashSync(paymentIntent.client_secret, salt);

    // update DB with the potion break once the payment is complete
    db.serialize(function () {
        db.run("INSERT INTO potion_breaks (date_created, end_date, user_id, app_id, total_value, charity_id, client_secret, status) VALUES (?,?,?,?,?,(SELECT charity_id FROM charities WHERE name = ?),?, ?)", [paymentIntent.created, endDate, req.user.user_id, req.user.potionBreakDetails.app_id, paymentIntent.amount, req.user.potionBreakDetails.charity, clientSecretHash, "ongoing"], function (err) {
            if (err != null) {
                console.err(err);
            } else {
                // redirect to success page
            }
        })
    })

})

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
router.post("/webhook", async (req, res) => {
    let data, eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log("💰 Payment captured!");
    } else if (eventType === "payment_intent.payment_failed") {
        console.log("❌ Payment failed.");
    }
    res.sendStatus(200);
});

// export routes up to routes.js
module.exports = router;