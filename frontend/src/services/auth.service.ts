import api from './api';
import type { User } from '../hooks/useAuth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterTenantData {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  /**
   * Register a new tenant with admin user
   */
  registerTenant: async (data: RegisterTenantData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and return access token
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh access token using refresh token from cookie
   */
  refresh: async () => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  /**
   * Logout user and clear refresh token cookie
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
