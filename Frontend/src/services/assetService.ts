/**
 * assetService.ts - Asset inventory API calls.
 * Uses the shared apiClient from authService for JWT auth.
 */

import { apiClient } from "./authService";
import type { Asset } from "../types/types";

/**
 * Get all assets (IT Agent + Admin).
 */
export async function getAllAssets(): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>("/assets");
  return response.data;
}

/**
 * Get available assets only (IT Agent + Admin).
 */
export async function getAvailableAssets(): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>("/assets/available");
  return response.data;
}

/**
 * Get a single asset by ID (IT Agent + Admin).
 */
export async function getAssetById(id: number): Promise<Asset> {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
}

/**
 * Create a new asset (Admin only).
 */
export async function createAsset(data: {
  name: string;
  serial_number: string;
  description?: string;
}): Promise<Asset> {
  const response = await apiClient.post<Asset>("/assets", data);
  return response.data;
}

/**
 * Delete an asset (Admin only).
 */
export async function deleteAsset(id: number): Promise<void> {
  await apiClient.delete(`/assets/${id}`);
}

/**
 * Assign an asset to a user (IT Agent + Admin).
 */
export async function assignAsset(
  assetId: number,
  userId: number,
): Promise<Asset> {
  const response = await apiClient.patch<Asset>(`/assets/${assetId}/assign`, {
    userId,
  });
  return response.data;
}

/**
 * Unassign an asset — return to AVAILABLE (IT Agent + Admin).
 */
export async function unassignAsset(assetId: number): Promise<Asset> {
  const response = await apiClient.patch<Asset>(
    `/assets/${assetId}/unassign`,
  );
  return response.data;
}
