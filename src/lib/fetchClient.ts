import { API_BASE_URL } from "./api";

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 && endpoint !== "/auth/refresh") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => fetchWithAuth(endpoint, options));
        }

        isRefreshing = true;

        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!refreshResponse.ok) {
            processQueue(
              new Error("Failed to refresh token - Session expired"),
            );
            setAccessToken(null);
            window.location.href = "/login";
            throw new Error("Session expired - Please login again");
          }

          const data = await refreshResponse.json();
          setAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          return fetchWithAuth(endpoint, options);
        } catch (error) {
          processQueue(error as Error, null);
          throw error;
        } finally {
          isRefreshing = false;
        }
      }

      const error = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));

      throw new Error(
        error.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export const fetchClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchWithAuth<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchWithAuth<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchWithAuth<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchWithAuth<T>(endpoint, { ...options, method: "DELETE" }),
};
