var createCustomer = function (publicKey) {
    return fetch("/create-stripe-customer", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function (response) {
            // console.log(response);
            return;
        })
        .catch(function (error) {
            console.error(error);
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
            // console.log(response);
            return response.json();
        })
        .then(function (response) {
            createCustomer(response.publicKey);
        })
        .catch(function (error) {
            console.error(error);
        });
};

getPublicKey();