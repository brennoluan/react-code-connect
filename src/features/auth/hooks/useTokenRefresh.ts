import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import { useAuth } from "./useAuth";

interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
}

export function useTokenRefresh() {
  const { accessToken, setAuth, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      const refreshTime = timeUntilExpiry - 60000;
      if (refreshTime <= 0) {
        console.log("Token will expire soon, refreshing...");
        authService
          .refresh()
          .then((response) => {
            setAuth(response);
          })
          .catch((error) => {
            console.error("Failed to refresh token:", error);
            logout();
          });
      }

      console.log(
        `Token will expire in ${Math.floor(refreshTime / 1000)} seconds`,
      );

      const timerId = setTimeout(() => {
        console.log("Refreshing token...");
        authService
          .refresh()
          .then((response) => {
            setAuth(response);
            console.log("Token refreshed successfully");
          })
          .catch((error) => {
            console.error("Failed to refresh token:", error);
            logout();
          });
      }, refreshTime);

      return () => clearTimeout(timerId);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }, [accessToken]);
}
