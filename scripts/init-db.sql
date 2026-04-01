-- Schema for Parking Reservation System
-- 60 spots: rows A-F, 10 per row. A & F = electric charger spots.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'secretary', 'manager')),
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (vehicle_type IN ('regular', 'electric', 'hybrid')),
    license_plate VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_number VARCHAR(3) UNIQUE NOT NULL,
    row CHAR(1) NOT NULL,
    position INTEGER NOT NULL,
    has_charger BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    spot_id UUID NOT NULL REFERENCES parking_spots(id),
    date DATE NOT NULL,
    slot VARCHAR(4) NOT NULL CHECK (slot IN ('AM', 'PM', 'FULL')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'completed', 'no_show', 'cancelled')),
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    UNIQUE(spot_id, date, slot)
);
