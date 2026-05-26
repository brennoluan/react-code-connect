import { fetchClient } from "../../../lib/fetchClient";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../types/auth.types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchClient.post<AuthResponse>("/auth/login", credentials);
  },
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchClient.post<AuthResponse>("/auth/register", data);
  },
  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};
