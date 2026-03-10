/**
 * types.ts - All TypeScript types/interfaces used in the app.
 * Aligned with the backend entity definitions.
 */

// The three roles a user can have (matches backend Role enum)
export type UserRole = "EMPLOYEE" | "IT_AGENT" | "ADMIN";

// Ticket priority levels (matches backend TicketPriority enum)
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Ticket status (matches backend TicketStatus enum)
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "SLA_BREACHED";

// A user in our system (matches backend User entity, no password exposed)
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isAvailable: boolean;
  activeTicketsCount: number;
}

// Auth response from login/register
export interface AuthResponse {
  access_token: string;
  user: User;
}

// A support ticket (matches backend Ticket entity with relations)
export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  assetType: string | null;
  status: TicketStatus;
  createdBy: User;
  assignedTo: User | null;
  asset: Asset | null;
  slaDeadline: string | null;
  createdAt: string;
}

// A chat message on a ticket
export interface Message {
  id: number;
  content: string;
  sender: User;
  createdAt: string;
}

// Asset status (matches backend Asset entity)
export type AssetStatus = "AVAILABLE" | "ASSIGNED";

// An IT asset in inventory (matches backend Asset entity)
export interface Asset {
  id: number;
  name: string;
  serial_number: string;
  description: string | null;
  status: AssetStatus;
  assigned_to: number | null;
  assignedUser: { id: number; name: string; email: string } | null;
  created_at: string;
  updated_at: string;
}
