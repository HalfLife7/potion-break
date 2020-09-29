exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("game_movies")
    .del()
    .then(function () {
      // t.integer('game_id')
      //     .unsigned()
      //     .references('id')
      //     .inTable('games')
      //     .notNull()
      //     .onDelete('cascade')
      // t.integer('id').unsigned()
      // t.text('name')
      // t.text('thumbnail')
      // t.text('webm_480')
      // t.text('webm_max')
      // t.text('mp4_480')
      // t.text('mp4_max')
      // t.primary(['id', 'game_id'])
      return knex("game_movies").insert([
        {
          game_id: 570,
          id: 256692021,
          name: "Dota 2 - Join the Battle",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692021/movie.293x165.jpg?t=1599609272",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692021/movie480.webm?t=1599609272",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692021/movie_max.webm?t=1599609272",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692021/movie480.mp4?t=1599609272",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692021/movie_max.mp4?t=1599609272",
        },
        {
          game_id: 570,
          id: 256692017,
          name: "Dota 2 - Sizzle Reel",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692017/movie.293x165.jpg?t=1599609279",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692017/movie480_vp9.webm?t=1599609279",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692017/movie_max_vp9.webm?t=1599609279",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692017/movie480.mp4?t=1599609279",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256692017/movie_max.mp4?t=1599609279",
        },
        {
          game_id: 570,
          id: 2028243,
          name: "Dota 2 - The Greeviling",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/2028243/movie.293x165.jpg?t=1599609286",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/2028243/movie480.webm?t=1599609286",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/2028243/movie_max.webm?t=1599609286",

          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/2028243/movie480.mp4?t=1599609286",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/2028243/movie_max.mp4?t=1599609286",
        },
        {
          game_id: 570,
          id: 81026,
          name: "Dota 2 Gamescom Trailer",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/81026/movie.293x165.jpg?t=1599609294",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/81026/movie480.webm?t=1599609294",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/81026/movie_max.webm?t=1599609294",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/81026/movie480.mp4?t=1599609294",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/81026/movie_max.mp4?t=1599609294",
        },
        {
          game_id: 570,
          id: 2040250,
          name: "Dota 2 Reborn - Custom Games Are Here",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/2040250/movie.293x165.jpg?t=1599609302",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/2040250/movie480.webm?t=1599609302",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/2040250/movie_max.webm?t=1599609302",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/2040250/movie480.mp4?t=1599609302",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/2040250/movie_max.mp4?t=1599609302",
        },
        {
          game_id: 435150,
          id: 256789813,
          name: "The Four Relics of Rivellon",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256789813/movie.293x165.jpg?t=1592914188",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256789813/movie480_vp9.webm?t=1592914188",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256789813/movie_max_vp9.webm?t=1592914188",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256789813/movie480.mp4?t=1592914188",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256789813/movie_max.mp4?t=1592914188",
        },
        {
          game_id: 435150,
          id: 256694830,
          name: "Divinity: Original Sin 2 - Trailer",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256694830/movie.293x165.jpg?t=1561485484",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256694830/movie480.webm?t=1561485484",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256694830/movie_max.webm?t=1561485484",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256694830/movie480.mp4?t=1561485484",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256694830/movie_max.mp4?t=1561485484",
        },
        {
          game_id: 546560,
          id: 256767815,
          name: "Half-Life: Alyx Announce Trailer",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256767815/movie.293x165.jpg?t=1583175736",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256767815/movie480.webm?t=1583175736",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256767815/movie_max.webm?t=1583175736",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256767815/movie480.mp4?t=1583175736",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256767815/movie_max.mp4?t=1583175736",
        },
        {
          game_id: 546560,
          id: 256776744,
          name: "Half-Life: Alyx Gameplay 1",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776744/movie.293x165.jpg?t=1583175743",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776744/movie480.webm?t=1583175743",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776744/movie_max.webm?t=1583175743",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776744/movie480.mp4?t=1583175743",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776744/movie_max.mp4?t=1583175743",
        },
        {
          game_id: 546560,
          id: 256776745,
          name: "Half-Life: Alyx Gameplay 2",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776745/movie.293x165.jpg?t=1583175752",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776745/movie480.webm?t=1583175752",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776745/movie_max.webm?t=1583175752",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776745/movie480.mp4?t=1583175752",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776745/movie_max.mp4?t=1583175752",
        },
        {
          game_id: 546560,
          id: 256776746,
          name: "Half-Life: Alyx Gameplay 3",
          thumbnail:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776746/movie.293x165.jpg?t=1583175759",
          webm_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776746/movie480.webm?t=1583175759",
          webm_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776746/movie_max.webm?t=1583175759",
          mp4_480:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776746/movie480.mp4?t=1583175759",
          mp4_max:
            "https://steamcdn-a.akamaihd.net/steam/apps/256776746/movie_max.mp4?t=1583175759",
        },
      ]);
    });
};
