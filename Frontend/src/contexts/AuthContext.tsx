/**
 * AuthContext.tsx - React context for authentication state management.
 * Provides user state, login/register/logout functions to the entire app.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, UserRole } from "../types/types";
import * as authService from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService
        .getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token is invalid/expired — clear it
          authService.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await authService.login(email, password);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User> => {
    const response = await authService.register(name, email, password, role);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
