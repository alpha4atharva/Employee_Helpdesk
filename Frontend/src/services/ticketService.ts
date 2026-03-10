/**
 * ticketService.ts - All ticket-related API calls.
 * Uses the shared apiClient from authService for JWT auth.
 */

import { apiClient } from "./authService";
import type { Ticket, TicketPriority, TicketStatus } from "../types/types";

/**
 * Create a new ticket (Employee only).
 */
export async function createTicket(data: {
  title: string;
  description: string;
  priority?: TicketPriority;
  assetType?: string;
}): Promise<Ticket> {
  const response = await apiClient.post<Ticket>("/tickets", data);
  return response.data;
}

/**
 * Get all tickets (any authenticated user).
 */
export async function getAllTickets(): Promise<Ticket[]> {
  const response = await apiClient.get<Ticket[]>("/tickets");
  return response.data;
}

/**
 * Get a single ticket by ID.
 */
export async function getTicketById(id: number): Promise<Ticket> {
  const response = await apiClient.get<Ticket>(`/tickets/${id}`);
  return response.data;
}

/**
 * Get the current employee's tickets.
 */
export async function getMyTickets(): Promise<Ticket[]> {
  const response = await apiClient.get<Ticket[]>("/tickets/my-tickets/list");
  return response.data;
}

/**
 * Update a ticket's status (IT Agent only).
 */
export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(`/tickets/${ticketId}/status`, {
    status,
  });
  return response.data;
}

/**
 * Assign an asset to a ticket (IT Agent only).
 */
export async function assignAssetToTicket(
  ticketId: number,
  assetId: number,
): Promise<Ticket> {
  const response = await apiClient.patch<Ticket>(
    `/tickets/${ticketId}/assign-asset`,
    { assetId },
  );
  return response.data;
}
