import axios from "axios";


let authToken: string | null = null;
let authFailureHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setAuthFailureHandler = (handler: (() => void) | null) => {
  authFailureHandler = handler;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // important for cookie-based refresh tokens
});

// Separate client to avoid interceptor recursion during refresh
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url?: string) =>
  !!url && /\/auth\/(login|register|refresh|logout)(\?|$)/.test(url);

const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = refreshClient
    .post<{ accessToken: string }>("/auth/refresh")
    .then((res) => {
      const newToken = res.data.accessToken;
      setAuthToken(newToken);
      return newToken;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } catch {
        setAuthToken(null);
        authFailureHandler?.();
        console.warn("Unauthorized - token may be invalid");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
