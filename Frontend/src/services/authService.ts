/**
 * authService.ts - Handles all authentication API calls.
 * Uses axios with JWT token management via localStorage.
 */

import axios from "axios";
import type { AuthResponse, User } from "../types/types";

const TOKEN_KEY = "auth_token";

// Create an axios instance with base URL and auth interceptor
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Log in with email and password.
 * Stores the JWT token and returns user info.
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem(TOKEN_KEY, response.data.access_token);
  return response.data;
}

/**
 * Register a new user.
 * Stores the JWT token and returns user info.
 */
export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    role,
  });
  localStorage.setItem(TOKEN_KEY, response.data.access_token);
  return response.data;
}

/**
 * Get the currently authenticated user from the stored token.
 * Used to restore session on page refresh.
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

/**
 * Log out the current user by clearing the token.
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if a token exists in localStorage.
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Export the axios instance so other services (tickets, etc.)
 * can use the same auth-aware client.
 */
export { apiClient };
