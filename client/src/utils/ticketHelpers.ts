/**
 * Utility functions for ticket operations
 * Helps construct proper payloads for API calls
 */

import type { Ticket, UpdateTicketPayload } from '@/types';

/**
 * Extracts only writable fields from a Ticket object for API updates
 * This prevents sending read-only fields to the backend which can cause 500 errors
 * 
 * @param ticket - The ticket object (may contain read-only fields)
 * @param fields - Optional object with specific fields to update
 * @returns UpdateTicketPayload with only writable fields
 * 
 * @example
 * // Update status only
 * const payload = extractWritableFields(ticket, { status: 'resolved' });
 * 
 * @example
 * // Update multiple fields
 * const payload = extractWritableFields(ticket, { 
 *   status: 'in_progress',
 *   assigned_to_id: 5 
 * });
 */
export function extractWritableFields(
  ticket: Ticket,
  fields?: Partial<UpdateTicketPayload>
): UpdateTicketPayload {
  const payload: UpdateTicketPayload = {};

  // If specific fields provided, use those
  if (fields) {
    if (fields.title !== undefined) payload.title = fields.title;
    if (fields.description !== undefined) payload.description = fields.description;
    if (fields.section_id !== undefined) payload.section_id = fields.section_id;
    if (fields.facility_id !== undefined) payload.facility_id = fields.facility_id;
    if (fields.status !== undefined) payload.status = fields.status;
    // Only include assigned_to_id if not closing
    if (fields.assigned_to_id !== undefined && fields.status !== 'closed') {
      payload.assigned_to_id = fields.assigned_to_id;
    }
    if (fields.pending_reason !== undefined) payload.pending_reason = fields.pending_reason;
  } else {
    // Extract writable fields from ticket object (if they exist as write-only properties)
    if (ticket.title !== undefined) payload.title = ticket.title;
    if (ticket.description !== undefined) payload.description = ticket.description;
    if (ticket.section_id !== undefined) payload.section_id = ticket.section_id;
    if (ticket.facility_id !== undefined) payload.facility_id = ticket.facility_id;
    if (ticket.status !== undefined) payload.status = ticket.status;
    // Only include assigned_to_id if not closing
    if (ticket.assigned_to_id !== undefined && ticket.status !== 'closed') {
      payload.assigned_to_id = ticket.assigned_to_id;
    }
    if (ticket.pending_reason !== undefined) payload.pending_reason = ticket.pending_reason;
  }

  return payload;
}

/**
 * Creates a complete update payload with ticket ID
 * 
 * @param ticket - The ticket to update
 * @param fields - Fields to update
 * @returns Object with id and update fields
 */
export function createUpdatePayload(
  ticket: Ticket,
  fields: Partial<UpdateTicketPayload>
): { id: number } & UpdateTicketPayload {
  return {
    id: ticket.id,
    ...extractWritableFields(ticket, fields),
  };
}
