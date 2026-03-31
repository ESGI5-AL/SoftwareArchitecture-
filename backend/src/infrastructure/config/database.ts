import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://parking:parking123@localhost:5432/parking_db',
});

export default pool;
