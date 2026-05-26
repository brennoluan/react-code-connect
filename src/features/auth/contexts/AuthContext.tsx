import { createContext, useState } from "react";
import type { AuthContextType, AuthResponse, User } from "../types/auth.types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setAuth = (auth: AuthResponse) => {
    setUser(auth.user);
    setAccessToken(auth.accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const isAuthenticated = !!user && !!accessToken;

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
