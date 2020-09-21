import express from "express";

const router = express.Router();

const Charity = require("../../models/charity");

router.get("/all", (req, res, next) => {
  Charity.query().then((charities) => {
    res.send(charities);
  });
});

router.get("/get-multiple-charities", (req, res, next) => {
  const query = req.query;

  let charityIds = [];

  for (const property in query) {
    charityIds.push(query[property]);
  }

  console.log(charityIds);

  Charity.query()
    .findByIds(charityIds)
    .then((charities) => {
      res.send(charities);
    });
  // Charity.query()
  //   .findById(charityId)
  //   .then((charity) => {
  //     res.send(charity);
  //   });
});

router.get("/:id", (req, res, next) => {
  const charityId = req.params.id;

  Charity.query()
    .findById(charityId)
    .then((charity) => {
      res.send(charity);
    });
});

module.exports = router;
