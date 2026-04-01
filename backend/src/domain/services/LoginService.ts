import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthUseCase } from '../ports/in/AuthUseCase';
import { UserRepository } from '../ports/out/UserRepository';
import { LoginResponseDTO } from '../dtos/AuthDTOs';

export class LoginService implements AuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userDTO } = user;
    return { user: userDTO, token };
  }
}
