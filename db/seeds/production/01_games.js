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
          header_image: "d4f836839254be08d8e9dd333ecc9a01782c26d2",
          last_updated: dateToday,
        },
        {
          id: 435150,
          name: "Divinity: Original Sin 2 - Definitive Edition",
          img_icon: "519a99caef7c5e2b4625c8c2fa0620fb66a752f3",
          header_image: "a83a75b8338e5576bea30f9f52c4eb2454e18efd",
          last_updated: dateToday,
        },
        {
          id: 546560,
          name: "Half-Life: Alyx",
          img_icon: "225032ac2ad1aca8f5fd98baa2b9daf1eebea5ca",
          header_image: " 	f7269f4b14f921e9dff13c05caf133ffe92b58ab",
          last_updated: dateToday,
        },
      ]);
    });
};
