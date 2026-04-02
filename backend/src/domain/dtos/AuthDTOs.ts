import { UserDTO } from '../models/User';

export interface LoginResponseDTO {
  user: UserDTO;
  token: string;
}
