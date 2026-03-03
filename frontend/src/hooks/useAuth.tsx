import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { setAuthFailureHandler, setAuthToken } from "../services/api";
import { authService } from "../services/auth.service";
import { useEffect } from "react";


export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
      setAuthFailureHandler(() => {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      });

      return () => {
        setAuthFailureHandler(null);
      };
    }, []);

    useEffect(() => {
      const restoreSession = async () => {
        try {
          const { accessToken, user } = await authService.refresh();
          
          setAuthToken(accessToken);
          setToken(accessToken);
          setUser(user);
        } catch {
          // No valid refresh token — user not logged in
        } finally {
          // Always set initializing to false when restore completes
          setIsInitializing(false);
        }
      };

      restoreSession();
    }, []);


    const login = useCallback((accessToken: string, userData: User) => {
      setAuthToken(accessToken);
        setToken(accessToken);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
  try {
    await authService.logout(); // 🔥 clear refresh cookie on backend
      } catch {
        // even if request fails, continue clearing local state
      }

      setAuthToken(null);
      setToken(null);
      setUser(null);
    }, []);


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
