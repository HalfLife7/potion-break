// Update with your config settings.

module.exports = {
  test: {
    client: 'pg',
    connection: 'postgres://localhost/test_db',
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/test`,
    },
  },
  development: {
    client: 'pg',
    connection: {
      database: 'potion_break',
      user: process.env.DB_USER_NAME,
      password: process.env.DB_USER_PASSWORD,
    },
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/development`,
    },
  },
  production: {
    client: 'pg',
    connection: {
      database: 'potion_break',
      user: process.env.DB_USER_NAME,
      password: process.env.DB_USER_PASSWORD,
    },
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/production`,
    },
  },
};
