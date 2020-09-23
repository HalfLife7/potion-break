let elements;
let card;
let style;
let stripe;
let setupIntents;

let orderComplete = function (stripe, clientSecret) {
  stripe.retrieveSetupIntent(clientSecret).then(function (result) {
    const { setupIntent } = result;

    const setupIntentId = setupIntent.id;
    const setupIntentDateCreated = setupIntent.created;

    // create invisible form to send post data and redirect to new page
    const formElement = document.createElement("form");
    formElement.setAttribute("id", "submitForm");
    formElement.setAttribute("action", "/potion-break-creation-success");
    formElement.setAttribute("method", "post");
    formElement.style.display = "none";
    document.body.appendChild(formElement);

    const inputElementSetupIntentId = document.createElement("input");
    inputElementSetupIntentId.setAttribute("type", "text");
    inputElementSetupIntentId.setAttribute("name", "setupIntentId");
    inputElementSetupIntentId.setAttribute("value", setupIntentId);
    document
      .getElementById("submitForm")
      .appendChild(inputElementSetupIntentId);

    const inputElementDateCreated = document.createElement("input");
    inputElementDateCreated.setAttribute("type", "text");
    inputElementDateCreated.setAttribute("name", "dateCreated");
    inputElementDateCreated.setAttribute("value", setupIntentDateCreated);
    document.getElementById("submitForm").appendChild(inputElementDateCreated);

    const inputElementEmail = document.createElement("input");
    inputElementEmail.setAttribute("type", "text");
    inputElementEmail.setAttribute("name", "paymentEmail");
    inputElementEmail.setAttribute(
      "value",
      document.getElementById("email").value
    );
    document.getElementById("submitForm").appendChild(inputElementEmail);

    const inputElementName = document.createElement("input");
    inputElementName.setAttribute("type", "text");
    inputElementName.setAttribute("name", "paymentName");
    inputElementName.setAttribute(
      "value",
      document.getElementById("name").value
    );
    document.getElementById("submitForm").appendChild(inputElementName);

    const inputElementAmount = document.createElement("input");
    inputElementAmount.setAttribute("type", "text");
    inputElementAmount.setAttribute("name", "paymentAmount");
    inputElementAmount.setAttribute(
      "value",
      document.getElementById("amount").value
    );
    document.getElementById("submitForm").appendChild(inputElementAmount);

    const inputElementCharity = document.createElement("input");
    inputElementCharity.setAttribute("type", "text");
    inputElementCharity.setAttribute("name", "charityName");
    inputElementCharity.setAttribute(
      "value",
      document.getElementById("charity").value
    );
    document.getElementById("submitForm").appendChild(inputElementCharity);

    const inputElementCalendar = document.createElement("input");
    inputElementCalendar.setAttribute("type", "text");
    inputElementCalendar.setAttribute("name", "endDate");
    inputElementCalendar.setAttribute(
      "value",
      document.getElementById("calendarInput").value
    );
    document.getElementById("submitForm").appendChild(inputElementCalendar);

    const inputElementAppId = document.createElement("input");
    inputElementAppId.setAttribute("type", "text");
    inputElementAppId.setAttribute("name", "appId");
    inputElementAppId.setAttribute(
      "value",
      document.getElementById("appId").value
    );
    document.getElementById("submitForm").appendChild(inputElementAppId);

    document.getElementById("submitForm").submit();
  });
};

const stripeElements = function (publicKey, setupIntent) {
  stripe = Stripe(publicKey);
  elements = stripe.elements();
  setupIntents = setupIntent;

  // Element styles
  style = {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "rgba(0,0,0,0.4)",
      },
    },
  };
};

// Handle payment submission when user clicks the pay button.
const button = document.getElementById("potion-break-form-submit");
button.addEventListener("click", function (event) {
  event.preventDefault();
  const displayError = document.getElementById("card-errors");
  displayError.textContent = "";

  // quick form validation to see if there are any empty
  document.getElementById("potion-break-form").checkValidity();
  document.getElementById("potion-break-form").reportValidity();
  if (document.getElementById("potion-break-form").checkValidity() === false) {
    return;
  }

  // disable button and set it to a spinner
  document
    .getElementById("potion-break-form-submit")
    .classList.add("is-loading");
  document
    .getElementById("potion-break-form-reset")
    .setAttribute("disabled", "true");

  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;

  stripe
    .confirmCardSetup(setupIntents.setupIntent.client_secret, {
      payment_method: {
        card,
        billing_details: {
          email,
          name,
        },
      },
    })
    .then(function (result) {
      console.log(result);
      if (result.error) {
        displayError.textContent = result.error.message;

        // renable button
        document
          .getElementById("potion-break-form-submit")
          .classList.remove("is-loading");
        document
          .getElementById("potion-break-form-reset")
          .removeAttribute("disabled");
      } else {
        // The PaymentMethod was successfully set up
        orderComplete(stripe, setupIntents.setupIntent.client_secret);
      }
    });
});

const getSetupIntent = function (publicKey) {
  return fetch("/create-setup-intent", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (setupIntent) {
      console.log(setupIntent);
      stripeElements(publicKey, setupIntent);
      card = elements.create("card", {
        style,
      });

      card.mount("#card-element");
    });
};

const getPublicKey = function () {
  return fetch("/public-key", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      getSetupIntent(response.publicKey);
    });
};

getPublicKey();
