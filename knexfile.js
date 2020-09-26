// Update with your config settings.

module.exports = {
  test: {
    client: "pg",
    connection: "postgres://localhost/test_db",
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/test`,
    },
  },
  development: {
    client: "pg",
    // connection: {
    //   host: process.env.DATABASE_HOST,
    //   database: process.env.DATABASE_NAME,
    //   user: process.env.DATABASE_USER_NAME,
    //   password: process.env.DATABASE_USER_PASSWORD,
    //   port: process.env.DATABASE_PORT,
    // },
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/development`,
    },
  },
  production: {
    client: "pg",
    // connection: {
    //   host: process.env.DATABASE_HOST,
    //   database: process.env.DATABASE_NAME,
    //   user: process.env.DATABASE_USER_NAME,
    //   password: process.env.DATABASE_USER_PASSWORD,
    //   port: process.env.DATABASE_PORT,
    // },
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/production`,
    },
  },
};
