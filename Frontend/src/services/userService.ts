/**
 * userService.ts - User management API calls (admin).
 * Uses the shared apiClient from authService for JWT auth.
 */

import { apiClient } from "./authService";
import type { User, UserRole } from "../types/types";

/** Get all users (Admin only). */
export async function getAllUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
}

/** Admin creates a new user with a role. */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  const response = await apiClient.post<User>("/users", data);
  return response.data;
}

/** Admin deletes a user. */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

/** Admin changes a user's role. */
export async function updateUserRole(
  id: number,
  role: UserRole,
): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
  return response.data;
}
