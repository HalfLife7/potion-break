var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../../config/config.js");
var db = require("../../config/db.js");


const {
    default: Axios
} = require("axios");
const {
    response
} = require("express");

// stripe setup
var stripe = require("stripe")(config.STRIPE_SK_TEST);

router.get("/public-key", (req, res) => {
    res.send({
        publicKey: config.STRIPE_PK_TEST
    });
});

router.post("/create-stripe-customer", async (req, res) => {
    console.log("starting create-stripe-customer");
    // Create or use an existing Customer to associate with the SetupIntent.
    // The PaymentMethod will be stored to this Customer for later use.
    db.serialize(function () {
        db.get("SELECT stripe_customer_id FROM users WHERE user_id = (?)", [req.user.user_id], function (err, row) {
            if (err != null) {
                console.error(err);
            } else {
                console.log(row.stripe_customer_id);
                // if nothing is returned, create a new customer and tie it to the user
                if (row.stripe_customer_id == null) {
                    // create customer
                    stripe.customers.create({
                        description: req.user.steam_id
                    }, function (err, customer) {
                        console.log(customer);
                        // update the user with the customer_id
                        db.run("UPDATE users SET stripe_customer_id = (?) WHERE user_id = (?)", [customer.id, req.user.user_id], function (err) {
                            if (err != null) {
                                console.error(err);
                            } else {
                                // do nothing after updating the user's stripe_customer_id
                            }
                        })
                    });
                } else {
                    // do nothing if user already is a customer in stripe
                }
            }
        })
    })
});

router.post("/create-setup-intent", async (req, res) => {
    console.log("STARTING create-setup-intent")
    // use an existing Customer to associate with the SetupIntent.
    // The PaymentMethod will be stored to this Customer for later use.

    db.get("SELECT stripe_customer_id FROM users WHERE user_id = (?)", [req.user.user_id], function (err, row) {
        if (err != null) {
            console.error(err);
        } else {
            console.log(row);
            stripe.customers.retrieve(
                row.stripe_customer_id,
                function (err, customer) {
                    // asynchronously called
                    console.log("GOT CUSTOMER");
                    console.log(customer);
                    if (err != null) {
                        console.error(err);
                    } else {
                        console.log("BEGIN CREATING SETUPINTENTS")
                        stripe.setupIntents.create({
                                customer: customer.id
                            },
                            function (err, setupIntent) {
                                console.log("created setupIntent!")
                                console.log(setupIntent);
                                // asynchronously called
                                if (err != null) {
                                    console.error(err);
                                } else {
                                    res.send({
                                        setupIntent: setupIntent
                                    });
                                }
                            }
                        );
                    }
                }
            );
        }
    })
});

// // get user payment information using stripe
// router.post('/create-payment-intent', async function (req, res) {
//     console.log("BEGIN CREATE PAYMENT INTENT")
//     console.log(req.user);
//     const potionBreakDetails = req.user.potionBreakDetails;
//     console.log(potionBreakDetails);

//     db.serialize(function () {
//         db.run("UPDATE users SET name = (?), email = (?) WHERE user_id = (?)", [req.user.name, req.user.email, req.user.user_id], function (err) {
//             if (err != null) {
//                 console.err(err);
//             } else {
//                 let currencyType = "cad";
//                 let orderAmount = currency(potionBreakDetails.amount).intValue;
//                 console.log(orderAmount);

//                 // Create a PaymentIntent with the order amount and currency
//                 const paymentIntent = await stripe.paymentIntents.create({
//                     amount: orderAmount,
//                     currency: currencyType,
//                     capture_method: 'manual'
//                 });

//                 console.log("SENDING PAYMENT INTENT")
//                 // Send publishable key and PaymentIntent details to client
//                 res.send({
//                     publishableKey: process.env.STRIPE_PK_TEST,
//                     clientSecret: paymentIntent.client_secret
//                 });
//             }
//         })
//     })
// })

// router.post('/send-payment-intent', function (req, res) {
//     console.log("BEGIN SEND PAYMENT INTENT");
//     const paymentIntent = req.body;
//     console.log(paymentIntent);
//     // store date time object as UNIX timestamp - https://stackoverflow.com/questions/11893083/convert-normal-date-to-unix-timestamp
//     let endDate = Math.floor(req.user.potionBreakDetails.endDate.getTime() / 1000);

//     // update DB with the potion break once the payment is complete
//     db.serialize(function () {
//         db.run("INSERT INTO potion_breaks (date_created, end_date, user_id, app_id, total_value, charity_id, client_secret, status) VALUES (?,?,?,?,?,(SELECT charity_id FROM charities WHERE name = ?),?, ?)", [paymentIntent.created, endDate, req.user.user_id, req.user.potionBreakDetails.app_id, paymentIntent.amount, req.user.potionBreakDetails.charity, clientSecretHash, "ongoing"], function (err) {
//             if (err != null) {
//                 console.err(err);
//             } else {
//                 // redirect to success page
//             }
//         })
//     })

// })
// Webhook handler for asynchronous events.
router.post("/webhook", async (req, res) => {
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
            () => {
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