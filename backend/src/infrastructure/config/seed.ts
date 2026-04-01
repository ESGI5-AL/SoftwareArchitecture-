import bcrypt from 'bcrypt';
import { query } from './database';

export const seedDatabase = async () => {
  console.log('Starting database seeding...');

  try {
    // 1. Create Tables
    await query(`
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
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS parking_spots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          spot_number VARCHAR(3) UNIQUE NOT NULL,
          row CHAR(1) NOT NULL,
          position INTEGER NOT NULL,
          has_charger BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true
      );
    `);

    await query(`
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
    `);

    // 2. Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      ['employee@parking.com', passwordHash, 'Employee', 'One', 'employee', 'regular'],
      ['secretary@parking.com', passwordHash, 'Secretary', 'One', 'secretary', 'regular'],
      ['manager@parking.com', passwordHash, 'Manager', 'One', 'manager', 'electric'],
    ];

    for (const u of users) {
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, vehicle_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        u
      );
    }

    // 3. Seed Spots (60 spots: A-F, 01-10)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const row of rows) {
      for (let pos = 1; pos <= 10; pos++) {
        const spotNumber = `${row}${pos.toString().padStart(2, '0')}`;
        const hasCharger = row === 'A' || row === 'F';
        await query(
          `INSERT INTO parking_spots (spot_number, row, position, has_charger)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (spot_number) DO NOTHING`,
          [spotNumber, row, pos, hasCharger]
        );
      }
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
