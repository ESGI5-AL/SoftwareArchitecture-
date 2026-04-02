import { UserRepository } from '../../../../domain/ports/out/UserRepository';
import { User } from '../../../../domain/models/User';
import { query } from '../../../config/database';

export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      `SELECT id, email, password_hash AS "passwordHash", first_name AS "firstName",
              last_name AS "lastName", role, vehicle_type AS "vehicleType",
              license_plate AS "licensePlate", is_active AS "isActive", created_at AS "createdAt"
       FROM users WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT id, email, password_hash AS "passwordHash", first_name AS "firstName",
              last_name AS "lastName", role, vehicle_type AS "vehicleType",
              license_plate AS "licensePlate", is_active AS "isActive", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }
}
