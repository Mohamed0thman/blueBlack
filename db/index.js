const { Pool, Client } = require("pg");

if (process.env.DATABASE_URL) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect(function () {
    console.log("connect to heroku db");
  });
  module.exports = {
    query: (text, params) => client.query(text, params),
  };
} else {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  pool.connect(function () {
    console.log("connect to db");
  });
  module.exports = {
    query: (text, params) => pool.query(text, params),
  };
}
