const { Pool } = require('pg');
require("dotenv").config({ path: "./config.env" });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI
});

module.exports = pool;
