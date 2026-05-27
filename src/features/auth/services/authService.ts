import { fetchClient } from "../../../lib/fetchClient";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../types/auth.types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchClient.post<AuthResponse>("/login", credentials);
  },
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return fetchClient.post<AuthResponse>("/register", {
      email: data.email,
      password: data.password,
      name: data.name,
    });
  },
  refresh: async (): Promise<AuthResponse> => {
    return fetchClient.post<AuthResponse>("/auth/refresh");
  },
  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};
