import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginService } from '../LoginService';
import { UserRepository } from '../../ports/out/UserRepository';
import { User } from '../../models/User';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockBcryptCompare = bcrypt.compare as jest.Mock;
const mockJwtSign = jwt.sign as jest.Mock;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JWT_SECRET = 'test-secret';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'alice@example.com',
  passwordHash: '$2b$10$hashedpassword',
  firstName: 'Alice',
  lastName: 'Dupont',
  role: 'employee',
  vehicleType: 'regular',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  ...overrides,
});

const makeRepo = (user: User | null = makeUser()): UserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(user),
  findById: jest.fn().mockResolvedValue(user),
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('login — succès', () => {
    it('retourne le token et le userDTO (sans passwordHash) si les credentials sont valides', async () => {
      const user = makeUser();
      const repo = makeRepo(user);
      mockBcryptCompare.mockResolvedValue(true);
      mockJwtSign.mockReturnValue('signed-token');

      const service = new LoginService(repo, JWT_SECRET);
      const result = await service.login('alice@example.com', 'password123');

      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.id).toBe('user-1');
      expect(result.user.role).toBe('employee');
    });

    it('signe le JWT avec userId, role et une expiration de 24h', async () => {
      const user = makeUser({ role: 'manager' });
      const repo = makeRepo(user);
      mockBcryptCompare.mockResolvedValue(true);
      mockJwtSign.mockReturnValue('signed-token');

      const service = new LoginService(repo, JWT_SECRET);
      await service.login('alice@example.com', 'password123');

      expect(mockJwtSign).toHaveBeenCalledWith(
        { userId: 'user-1', role: 'manager' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    });
  });

  describe('login — email inconnu', () => {
    it("lance une erreur 'Invalid credentials' si l'utilisateur n'existe pas", async () => {
      const repo = makeRepo(null);
      mockBcryptCompare.mockResolvedValue(false);

      const service = new LoginService(repo, JWT_SECRET);
      await expect(service.login('unknown@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockBcryptCompare).not.toHaveBeenCalled();
    });
  });

  describe('login — mot de passe incorrect', () => {
    it("lance une erreur 'Invalid credentials' si le mot de passe ne correspond pas", async () => {
      const repo = makeRepo(makeUser());
      mockBcryptCompare.mockResolvedValue(false);

      const service = new LoginService(repo, JWT_SECRET);
      await expect(service.login('alice@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockJwtSign).not.toHaveBeenCalled();
    });
  });
});
