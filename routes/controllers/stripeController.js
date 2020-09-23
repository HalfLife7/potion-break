const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SK_TEST);

const router = express.Router();

const User = require("../../models/user");

router.get("/public-key", function (req, res) {
  res.send({
    publicKey: process.env.STRIPE_PK_TEST,
  });
});

router.post("/create-stripe-customer", async (req) => {
  // Create or use an existing Customer to associate with the SetupIntent.
  // The PaymentMethod will be stored to this Customer for later use.

  try {
    const user = await User.query()
      .findById(req.user.id)
      .select("stripe_customer_id");

    // if nothing is returned, create a new customer and tie it to the user
    if (user.stripe_customer_id === null) {
      // create customer
      const newCustomer = await stripe.customers.create({
        description: req.user.steam_id,
      });

      // update user with stripe details
      const updateUser = await User.query().findById(req.user.id).patch({
        stripe_customer_id: newCustomer.id,
      });
    } else {
      // do nothin since user is already tied to a stripe customer
    }
  } catch (err) {
    console.error(err.message);
  }
});

router.post("/create-setup-intent", async (req, res) => {
  try {
    // use an existing Customer to associate with the SetupIntent.
    // The PaymentMethod will be stored to this Customer for later use.
    const userStripeId = await User.query()
      .findById(req.user.id)
      .select("stripe_customer_id");
    const stripeCustomer = await stripe.customers.retrieve(
      userStripeId.stripe_customer_id
    );
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomer.id,
    });
    res.send({
      setupIntent,
    });
  } catch (err) {
    console.error(err.message);
  }
});

// export routes up to routes.js
module.exports = router;
