var elements;
var card;
var style;
var stripe;
var setupIntents;

var stripeElements = function (publicKey, setupIntent) {
    stripe = Stripe(publicKey);
    elements = stripe.elements();
    setupIntents = setupIntent;

    // Element styles
    style = {
        base: {
            fontSize: "16px",
            color: "#32325d",
            fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
            fontSmoothing: "antialiased",
            "::placeholder": {
                color: "rgba(0,0,0,0.4)"
            }
        }
    }
};



// Handle payment submission when user clicks the pay button.
var button = document.getElementById("potion-break-form-submit");
button.addEventListener("click", function (event) {
    console.log("BEGIN potion-break-form-submit")
    event.preventDefault();
    document.getElementById('potion-break-form').checkValidity();
    document.getElementById('potion-break-form').reportValidity();
    if (document.getElementById('potion-break-form').checkValidity() === false) {
        return;
    }
    // changeLoadingState(true);
    var email = document.getElementById("email").value;
    var name = document.getElementById("name").value;

    stripe
        .confirmCardSetup(setupIntents.setupIntent.client_secret, {
            payment_method: {
                card: card,
                billing_details: {
                    email: email,
                    name: name
                }
            }
        })
        .then(function (result) {
            console.log(result);
            if (result.error) {
                // changeLoadingState(false);
                // TODO: have display error show up in a modal
                var displayError = document.getElementById("card-errors");
                displayError.textContent = result.error.message;
            } else {
                // The PaymentMethod was successfully set up
                orderComplete(stripe, setupIntents.setupIntent.client_secret);
            }
        });
});


var getSetupIntent = function (publicKey) {
    return fetch("/create-setup-intent", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (setupIntent) {
            console.log("creating stripe elements");
            console.log(setupIntent);
            stripeElements(publicKey, setupIntent);
            card = elements.create("card", {
                style: style
            });

            card.mount("#card-element");
        });
};

var getPublicKey = function () {
    return fetch("/public-key", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            getSetupIntent(response.publicKey);
        });
};

// Show a spinner on payment submission
// var changeLoadingState = function (isLoading) {
//     if (isLoading) {
//         document.querySelector("button").disabled = true;
//         document.querySelector("#spinner").classList.remove("hidden");
//         // document.querySelector("#button-text").classList.add("hidden");
//     } else {
//         document.querySelector("button").disabled = false;
//         document.querySelector("#spinner").classList.add("hidden");
//         // document.querySelector("#button-text").classList.remove("hidden");
//     }
// };

/* Shows a success / error message when the payment is complete */
var orderComplete = function (stripe, clientSecret) {
    stripe.retrieveSetupIntent(clientSecret).then(function (result) {
        var setupIntent = result.setupIntent;
        console.log(setupIntent);
        var stripeData = setupIntent;
        console.log(stripeData);
        stripeData.email = document.getElementById("email").value;
        stripeData.name = document.getElementById("name").value;
        stripeData.amount = document.getElementById("amount").value;
        stripeData.charity = document.getElementById("charity").value;
        stripeData.endDate = document.getElementById("calendarInput").value;

        console.log(stripeData);

        // document.querySelector(".sr-payment-form").classList.add("hidden");
        // document.querySelector(".sr-result").classList.remove("hidden");
        // document.querySelector("pre").textContent = setupIntentJson;
        // setTimeout(function () {
        //     document.querySelector(".sr-result").classList.add("expand");
        // }, 200);

        // changeLoadingState(false);

        // TODO: GET REQUEST TO NEXT PAGE CONFIRMING SETUP
        // SEND SETUPINTENT DATA -> UPDATE USER WITH SETUPINTENT ID -> UPDATE THEIR POTION BREAKS AS WELL
        return fetch("/potion-break-creation-success", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(stripeData)
            })
            .then(function (response) {
                return response.json();
            })
    });
};

getPublicKey();

// // Element focus ring
// card.on("focus", function () {
//     var el = document.getElementById("card-element");
//     el.classList.add("focused");
// });

// card.on("blur", function () {
//     var el = document.getElementById("card-element");
//     el.classList.remove("focused");
// });