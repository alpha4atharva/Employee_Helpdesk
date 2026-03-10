/**
 * messageService.ts - Chat message API calls for tickets.
 * Uses the shared apiClient from authService for JWT auth.
 */

import { apiClient } from "./authService";
import type { Message } from "../types/types";

/**
 * Get all messages for a ticket.
 */
export async function getMessages(ticketId: number): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(`/messages/${ticketId}`);
  return response.data;
}

/**
 * Send a message on a ticket.
 */
export async function sendMessage(
  ticketId: number,
  content: string,
): Promise<Message> {
  const response = await apiClient.post<Message>(`/messages/${ticketId}`, {
    content,
  });
  return response.data;
}
