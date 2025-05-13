const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecuelasdb',
  password: 'eps77648',
  port: 5432,
});

module.exports = pool;
