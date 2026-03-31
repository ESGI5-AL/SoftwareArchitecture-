-- Initial schema for walking skeleton
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  total_spots INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  parking_lot_id UUID NOT NULL REFERENCES parking_lots(id),
  spot_number INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
-- Password for both accounts: "password123"
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@parkmanager.com', '$2b$10$xQxPqKmFpNzYjXjH0CJmNOqF9LbKPCmFcKjGvN8mXZp3GwqRvWKi6', 'admin'),
  ('user@test.com', '$2b$10$xQxPqKmFpNzYjXjH0CJmNOqF9LbKPCmFcKjGvN8mXZp3GwqRvWKi6', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO parking_lots (name, total_spots, hourly_rate) VALUES
  ('Parking Centre-Ville', 50, 3.00),
  ('Parking Gare', 100, 2.50),
  ('Parking Aéroport', 200, 5.00)
ON CONFLICT DO NOTHING;
