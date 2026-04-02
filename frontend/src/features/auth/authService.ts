import api from "../../shared/api/client";
import type { LoginCredentials, LoginResponse } from "./auth.types";

export const loginRequest = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
};
