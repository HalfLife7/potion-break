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
    connection: {
      host: process.env.DATABASE_URL,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_USER_PASSWORD,
      port: 5432,
    },
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/development`,
    },
  },
  production: {
    client: "pg",
    connection: {
      host: process.env.DATABASE_URL,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_USER_PASSWORD,
      port: process.env.DATABASE_PORT,
    },
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/production`,
    },
  },
};
