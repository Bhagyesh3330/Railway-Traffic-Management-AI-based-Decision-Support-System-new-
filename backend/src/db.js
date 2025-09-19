require('dotenv').config();
const { Pool } = require('pg');

// Prefer single DATABASE_URL if provided, else fall back to discrete vars with local defaults
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || '127.0.0.1',
      database: process.env.PGDATABASE || 'raildb',
      password: process.env.PGPASSWORD || 'password',
      port: Number(process.env.PGPORT) || 5432,
    });

module.exports = pool;
