import axios from "axios";


let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
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
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true;
      try {
        const newToken = await refreshAccessToken();
        error.config.headers = error.config.headers || {};
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch {
        // optional: force reload or redirect later
        console.warn("Unauthorized - token may be invalid");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
