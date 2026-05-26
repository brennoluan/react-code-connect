import { createContext, useEffect, useState } from "react";
import type { AuthContextType, AuthResponse, User } from "../types/auth.types";
import { setAccessToken as setFetchClientAccessToken } from "../../../lib/fetchClient";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setFetchClientAccessToken(accessToken);
  }, [accessToken]);

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
