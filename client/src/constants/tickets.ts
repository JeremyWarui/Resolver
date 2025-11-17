/**
 * Shared constants for the Resolver ticketing system
 */

import type { Ticket } from '@/types';

// Ticket status definitions
export const TICKET_STATUSES = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type TicketStatus = typeof TICKET_STATUSES[keyof typeof TICKET_STATUSES];

// Status display names
export const STATUS_LABELS: Record<Ticket['status'], string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

// All statuses in order
export const ALL_TICKET_STATUSES: Ticket['status'][] = [
  'open',
  'assigned',
  'in_progress',
  'pending',
  'resolved',
  'closed',
];

// Limited statuses for assignment mode (only active states)
export const ASSIGNMENT_STATUSES: Ticket['status'][] = [
  'open',
  'assigned',
  'in_progress',
];

// Active statuses (not resolved/closed)
export const ACTIVE_STATUSES: Ticket['status'][] = [
  'open',
  'assigned',
  'in_progress',
  'pending',
];
