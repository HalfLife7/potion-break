exports.up = async (knex) => {
  try {
    await knex.schema.createTable("users", (t) => {
      t.increments("id");
      t.text("steam_persona_name");
      t.text("steam_profile");
      t.text("steam_id").unique();
      t.text("steam_avatar");
      t.integer("total_steam_games_owned");
      t.integer("total_steam_games_played");
      t.text("name");
      t.text("email");
      t.text("stripe_customer_id");
    });
    await knex.schema.createTable("games", (t) => {
      t.integer("id").unsigned().primary();
      t.text("name");
      t.text("img_icon");
      t.text("img_logo");
      t.text("header_image");
      t.date("last_updated");
    });
    await knex.schema.createTable("user_games", (t) => {
      t.integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
      t.integer("game_id")
        .unsigned()
        .references("id")
        .inTable("games")
        .notNull();
      t.integer("playtime_forever");
      t.text("potion_break_active");
      t.primary(["user_id", "game_id"]);
    });
    await knex.schema.createTable("game_screenshots", (t) => {
      t.integer("game_id")
        .unsigned()
        .references("id")
        .inTable("games")
        .notNull()
        .onDelete("cascade");
      t.integer("id").unsigned();
      t.text("path_thumbnail");
      t.text("path_full");
      t.primary(["id", "game_id"]);
    });
    await knex.schema.createTable("game_movies", (t) => {
      t.integer("game_id")
        .unsigned()
        .references("id")
        .inTable("games")
        .notNull()
        .onDelete("cascade");
      t.integer("id").unsigned();
      t.text("name");
      t.text("thumbnail");
      t.text("webm_480");
      t.text("webm_max");
      t.text("mp4_480");
      t.text("mp4_max");
      t.primary(["id", "game_id"]);
    });
    await knex.schema.createTable("charities", (t) => {
      t.integer("id").unsigned().primary();
      t.text("name");
      t.text("full_name");
      t.text("description");
      t.text("img_path");
    });
    await knex.schema.createTable("potion_breaks", (t) => {
      t.increments("id");
      t.date("start_date");
      t.date("end_date");
      t.integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
      t.integer("game_id")
        .unsigned()
        .references("id")
        .inTable("games")
        .notNull();
      t.integer("charity_id")
        .unsigned()
        .references("id")
        .inTable("charities")
        .notNull();
      t.decimal("total_value");
      t.text("setup_intent_id");
      t.text("status");
      t.integer("playtime_start");
      t.integer("playtime_end");
      t.text("payment_status");
      t.text("stripe_payment_date_created");
    });
  } catch (err) {
    console.error(err.message);
  }
};

exports.down = async (knex) => {
  try {
    await knex.schema.dropTable("potion_breaks");
    await knex.schema.dropTable("charities");
    await knex.schema.dropTable("game_movies");
    await knex.schema.dropTable("game_screenshots");
    await knex.schema.dropTable("user_games");
    await knex.schema.dropTable("games");
    await knex.schema.dropTable("users");
  } catch (err) {
    console.error(err.message);
  }
};
