-- backend/src/seed.sql
-- Combined seed for Railway DSS: trains + users

-- =========================
-- Trains table + seed data
-- =========================
CREATE TABLE IF NOT EXISTS trains (
  id SERIAL PRIMARY KEY,
  train_number VARCHAR(20),
  name VARCHAR(100),
  category VARCHAR(20),
  origin VARCHAR(50),
  destination VARCHAR(50),
  scheduled_departure TIMESTAMP,
  actual_departure TIMESTAMP,
  scheduled_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  status VARCHAR(20)
);

-- Clear existing rows in trains (keeps table schema if it existed)
TRUNCATE TABLE trains;

INSERT INTO trains (train_number, name, category, origin, destination, scheduled_departure, actual_departure, scheduled_arrival, actual_arrival, status) VALUES
('12951','Mumbai Rajdhani','Express','Mumbai Central','New Delhi','2025-09-19 09:00:00','2025-09-19 09:05:00','2025-09-19 18:00:00','2025-09-19 18:10:00','Proceed'),
('90001','Churchgate - Virar Local','Local','Churchgate','Virar','2025-09-19 08:30:00','2025-09-19 08:35:00','2025-09-19 10:00:00','2025-09-19 10:05:00','Warning'),
('70020','Freight Goods','Freight','Surat','Vadodara','2025-09-19 06:00:00','2025-09-19 06:00:00','2025-09-19 12:00:00',NULL,'Proceed'),
('12001','Shatabdi Express','Express','Delhi','Bhopal','2025-09-19 07:30:00','2025-09-19 07:35:00','2025-09-19 11:30:00','2025-09-19 11:40:00','Proceed');

-- =========================
-- Users table + seed data
-- =========================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Dummy credentials (plain text for demo):
-- username: admin
-- password: Admin@123
-- role: Admin
INSERT INTO users (username, password, role)
VALUES ('admin', 'Admin@123', 'Admin');
