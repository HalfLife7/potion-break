const format = require("date-fns/format");

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("games")
    .del()
    .then(function () {
      const dateToday = format(new Date(), "yyyy-MM-dd");
      return knex("games").insert([
        {
          id: 570,
          name: "DOTA 2",
          img_icon: "0bbb630d63262dd66d2fdd0f7d37e8661a410075",
          header_image:
            "https://steamcdn-a.akamaihd.net/steam/apps/570/header.jpg",
          last_updated: dateToday,
        },
        {
          id: 435150,
          name: "Divinity: Original Sin 2 - Definitive Edition",
          img_icon: "519a99caef7c5e2b4625c8c2fa0620fb66a752f3",
          header_image:
            "https://steamcdn-a.akamaihd.net/steam/apps/435150/header.jpg",
          last_updated: dateToday,
        },
        {
          id: 546560,
          name: "Half-Life: Alyx",
          img_icon: "225032ac2ad1aca8f5fd98baa2b9daf1eebea5ca",
          header_image:
            "https://steamcdn-a.akamaihd.net/steam/apps/546560/header.jpg",
          last_updated: dateToday,
        },
      ]);
    });
};
