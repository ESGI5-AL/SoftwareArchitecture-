import { LoginResponseDTO } from '../../dtos/AuthDTOs';

export interface AuthUseCase {
  login(email: string, password: string): Promise<LoginResponseDTO>
}
