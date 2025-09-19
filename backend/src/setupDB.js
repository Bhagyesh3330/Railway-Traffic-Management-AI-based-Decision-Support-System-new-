require('dotenv').config();
const { Client } = require('pg');

// Helper to read env with defaults for local dev
const pgUser = process.env.PGUSER || 'postgres';
const pgHost = process.env.PGHOST || '127.0.0.1';
const pgPassword = process.env.PGPASSWORD || 'password';
const pgPort = Number(process.env.PGPORT) || 5432;

// Connect to default 'postgres' database
const client = new Client({
  user: pgUser,
  host: pgHost,
  database: 'postgres', // default DB
  password: pgPassword,
  port: pgPort
});

async function setupDatabase() {
  try {
    await client.connect();

    // Create database if not exists
    await client.query(`CREATE DATABASE raildb`)
      .then(() => console.log('Database "raildb" created successfully.'))
      .catch(err => {
        if (err.code === '42P04') { // already exists
          console.log('Database "raildb" already exists, skipping creation.');
        } else {
          throw err;
        }
      });

    await client.end();

    // Connect to the 'raildb' database
    const dbClient = new Client({
      user: pgUser,
      host: pgHost,
      database: 'raildb',
      password: pgPassword,
      port: pgPort
    });

    await dbClient.connect();

    // Create tables
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE
      );
    `);

    // Extend stations with metadata columns if missing
    await dbClient.query(`ALTER TABLE stations ADD COLUMN IF NOT EXISTS area VARCHAR(100)`);
    await dbClient.query(`ALTER TABLE stations ADD COLUMN IF NOT EXISTS is_junction BOOLEAN DEFAULT false`);
    await dbClient.query(`ALTER TABLE stations ADD COLUMN IF NOT EXISTS num_tracks INT DEFAULT 2`);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS trains (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        priority INT NOT NULL
      );
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        train_id INT REFERENCES trains(id),
        station_id INT REFERENCES stations(id),
        arrival_time TIME,
        departure_time TIME
      );
    `);

    // Insert mock data
    await dbClient.query(`
      INSERT INTO stations (name, code) VALUES 
      ('Mumbai Central', 'BCT'),
      ('Delhi Junction', 'DLI'),
      ('Kolkata', 'KOAA')
      ON CONFLICT DO NOTHING;
    `);

    await dbClient.query(`
      INSERT INTO trains (name, type, priority) VALUES
      ('Rajdhani Express', 'Express', 1),
      ('Local Mumbai', 'Local', 3),
      ('Freight 101', 'Freight', 2)
      ON CONFLICT DO NOTHING;
    `);

    await dbClient.query(`
      INSERT INTO schedules (train_id, station_id, arrival_time, departure_time) VALUES
      (1, 1, '08:00', '08:10'),
      (1, 2, '18:00', '18:05'),
      (2, 1, '09:00', '09:05'),
      (2, 2, '19:00', '19:05'),
      (3, 1, '10:00', '10:15')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Tables created and mock data inserted successfully.');
    await dbClient.end();
    process.exit(0);

  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setupDatabase();
