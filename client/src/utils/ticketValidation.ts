/**
 * Shared validation schemas and utilities for ticket forms
 * Consolidates validation logic across CreateTicket and edit forms
 */
import { z } from 'zod';

/**
 * Validation schema for creating a new ticket
 */
export const createTicketSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  section_id: z.string({
    required_error: 'Please select a section.',
  }),
  facility_id: z.string({
    required_error: 'Please select a facility.',
  }),
});

/**
 * Validation schema for updating ticket details (title, description, section, facility)
 */
export const updateTicketDetailsSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }).optional(),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }).optional(),
  section_id: z.number().optional(),
  facility_id: z.number().optional(),
});

/**
 * Validation schema for updating ticket status
 */
export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed']),
  assigned_to_id: z.number().nullable().optional(),
  pending_reason: z.string().min(1).optional(),
});

/**
 * Validation schema for ticket comments
 */
export const ticketCommentSchema = z.object({
  comment: z.string().min(1, { message: "Comment cannot be empty." }),
});

/**
 * Validation schema for ticket feedback
 */
export const ticketFeedbackSchema = z.object({
  rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  comment: z.string().optional(),
});

// Export type inference helpers
export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
export type UpdateTicketDetailsFormValues = z.infer<typeof updateTicketDetailsSchema>;
export type UpdateTicketStatusFormValues = z.infer<typeof updateTicketStatusSchema>;
export type TicketCommentFormValues = z.infer<typeof ticketCommentSchema>;
export type TicketFeedbackFormValues = z.infer<typeof ticketFeedbackSchema>;
