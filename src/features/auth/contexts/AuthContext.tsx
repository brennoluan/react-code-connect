import { createContext, useEffect, useState } from "react";
import type { AuthContextType, AuthResponse, User } from "../types/auth.types";
import { setAccessToken as setFetchClientAccessToken } from "../../../lib/fetchClient";
import { authService } from "../services/authService";

const USER_STORAGE_KEY = "@CodeConnect:user";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setFetchClientAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isHydrated]);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!savedUser) {
          setIsLoading(false);
          setIsHydrated(true);
          return;
        }

        const response = await authService.refresh();
        setUser(response.user);
        setAccessToken(response.accessToken);
      } catch (error) {
        console.error("Erro ao carregar autenticação:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };
    hydrateAuth();
  }, []);

  const setAuth = (auth: AuthResponse) => {
    setUser(auth.user);
    setAccessToken(auth.accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const isAuthenticated = !!user && !!accessToken;

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    setAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
