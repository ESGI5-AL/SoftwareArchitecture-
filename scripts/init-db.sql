-- Schema for Parking Reservation System
-- 60 spots: rows A-F, 10 per row. A & F = electric charger spots.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('employee', 'secretary', 'manager'))
);

CREATE TABLE IF NOT EXISTS parking_spots (
  id VARCHAR(3) PRIMARY KEY,
  row_letter CHAR(1) NOT NULL,
  spot_number INTEGER NOT NULL,
  has_charger BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT valid_row CHECK (row_letter IN ('A','B','C','D','E','F')),
  CONSTRAINT valid_number CHECK (spot_number BETWEEN 1 AND 10)
);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  spot_id VARCHAR(3) NOT NULL REFERENCES parking_spots(id),
  slot VARCHAR(2) NOT NULL,
  reservation_date DATE NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_slot CHECK (slot IN ('AM', 'PM')),
  CONSTRAINT unique_spot_slot UNIQUE (spot_id, slot, reservation_date)
);

-- Generate all 60 parking spots (A01-F10)
-- Rows A and F have electric chargers
INSERT INTO parking_spots (id, row_letter, spot_number, has_charger)
SELECT
  row_letter || LPAD(num::text, 2, '0'),
  row_letter,
  num,
  row_letter IN ('A', 'F')
FROM
  (VALUES ('A'),('B'),('C'),('D'),('E'),('F')) AS rows(row_letter),
  generate_series(1, 10) AS num
ON CONFLICT (id) DO NOTHING;

-- Seed users
-- Password for all accounts: "password123"
INSERT INTO users (email, password_hash, role) VALUES
  ('secretary@parkmanager.com', '$2b$10$xQxPqKmFpNzYjXjH0CJmNOqF9LbKPCmFcKjGvN8mXZp3GwqRvWKi6', 'secretary'),
  ('manager@parkmanager.com', '$2b$10$xQxPqKmFpNzYjXjH0CJmNOqF9LbKPCmFcKjGvN8mXZp3GwqRvWKi6', 'manager'),
  ('user@test.com', '$2b$10$xQxPqKmFpNzYjXjH0CJmNOqF9LbKPCmFcKjGvN8mXZp3GwqRvWKi6', 'employee')
ON CONFLICT (email) DO NOTHING;

-- Mock reservations for testing availability
INSERT INTO reservations (user_id, spot_id, slot, reservation_date, checked_in, status)
SELECT u.id, v.spot_id, v.slot, v.d::date, v.checked_in, 'active'
FROM users u
CROSS JOIN (
  VALUES
    -- Today: a few spots taken
    ('B03', 'AM', CURRENT_DATE, true),
    ('B05', 'AM', CURRENT_DATE, true),
    ('C01', 'PM', CURRENT_DATE, false),
    ('A02', 'AM', CURRENT_DATE, true),
    ('D07', 'AM', CURRENT_DATE, false),
    ('A05', 'PM', CURRENT_DATE, false),
    -- Tomorrow: more spots
    ('B01', 'AM', CURRENT_DATE + 1, false),
    ('B01', 'PM', CURRENT_DATE + 1, false),
    ('C04', 'AM', CURRENT_DATE + 1, false),
    ('E02', 'PM', CURRENT_DATE + 1, false),
    ('F03', 'AM', CURRENT_DATE + 1, false),
    -- Day after tomorrow
    ('A01', 'AM', CURRENT_DATE + 2, false),
    ('D02', 'PM', CURRENT_DATE + 2, false),
    ('F10', 'AM', CURRENT_DATE + 2, false)
) AS v(spot_id, slot, d, checked_in)
WHERE u.email = 'user@test.com';
