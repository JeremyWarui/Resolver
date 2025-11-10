import apiClient from '../client';
import type {
  Ticket,
  TicketsResponse,
  CreateTicketPayload,
  UpdateTicketPayload,
  TicketsParams,
} from '@/types';

const ticketsService = {
  // Get all tickets with filters and pagination
  getTickets: async (params?: TicketsParams): Promise<TicketsResponse> => {
    const response = await apiClient.get('/tickets/', { params });
    return response.data;
  },

  // Get single ticket by ID
  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${id}/`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (data: CreateTicketPayload): Promise<Ticket> => {
    const response = await apiClient.post('/tickets/', data);
    return response.data;
  },

  // Update a ticket
  updateTicket: async (id: number, data: UpdateTicketPayload): Promise<Ticket> => {
    const response = await apiClient.patch(`/tickets/${id}/`, data);
    return response.data;
  },

  // Delete a ticket
  deleteTicket: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}/`);
  },

  // Get ticket comments
  getTicketComments: async (ticketId: number) => {
    const response = await apiClient.get(`/tickets/${ticketId}/comments/`);
    return response.data;
  },

  // Add comment to ticket
  addTicketComment: async (ticketId: number, text: string) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments/`, {
      text,
    });
    return response.data;
  },

  // Get ticket feedback
  getTicketFeedback: async (ticketId: number) => {
    const response = await apiClient.get(`/tickets/${ticketId}/feedback/`);
    return response.data;
  },

  // Add feedback to ticket
  addTicketFeedback: async (ticketId: number, rating: number, comment?: string) => {
    const response = await apiClient.post(`/tickets/${ticketId}/feedback/`, {
      rating,
      comment,
    });
    return response.data;
  },
};

export default ticketsService;
