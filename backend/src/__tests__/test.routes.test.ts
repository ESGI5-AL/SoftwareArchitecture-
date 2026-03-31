import request from 'supertest';
import app from '../app';

jest.mock('../infrastructure/config/database', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from '../infrastructure/config/database';
const mockQuery = pool.query as jest.Mock;

describe('GET /api/test', () => {
  it('returns skeleton data when the DB responds', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ server_time: new Date('2024-01-01'), db_name: 'parking_db' }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] });

    const res = await request(app).get('/api/test');

    expect(res.status).toBe(200);
    expect(res.body.details.database).toBe('parking_db');
    expect(res.body.details.seedData.users).toBe(2);
    expect(res.body.details.seedData.parkingLots).toBe(3);
  });

  it('returns 500 when the DB connection fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Connection refused'));

    const res = await request(app).get('/api/test');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Database connection failed');
    expect(res.body.error).toBe('Connection refused');
  });
});
