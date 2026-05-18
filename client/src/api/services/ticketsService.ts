import apiClient from '../client';
import type {
  Ticket,
  TicketsResponse,
  CreateTicketPayload,
  CreateTicketCataloguePayload,
  CreateTicketCatalogueResponse,
  UpdateTicketPayload,
  BulkStatusUpdatePayload,
  TicketsParams,
  ApproveTicketPayload,
  RejectTicketPayload,
} from '@/types';

const ticketsService = {
  getTickets: async (params?: TicketsParams): Promise<TicketsResponse> => {
    const response = await apiClient.get('/tickets/', { params });
    return response.data;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${id}/`);
    return response.data;
  },

  createTicket: async (data: CreateTicketPayload): Promise<Ticket> => {
    const response = await apiClient.post('/tickets/', data);
    return response.data;
  },

  createTicketCatalogue: async (data: CreateTicketCataloguePayload): Promise<CreateTicketCatalogueResponse> => {
    const response = await apiClient.post('/tickets/create/', data);
    return response.data;
  },

  updateTicket: async (id: number, data: UpdateTicketPayload): Promise<Ticket> => {
    const response = await apiClient.patch(`/tickets/${id}/`, data);
    return response.data;
  },

  deleteTicket: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}/`);
  },

  escalateTicket: async (ticketId: number, reason?: string): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${ticketId}/escalate/`, { reason: reason ?? '' });
    return response.data;
  },

  closeTicket: async (ticketId: number, closureNotes?: string): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${ticketId}/close/`, { closure_notes: closureNotes ?? '' });
    return response.data;
  },

  approveTicket: async (ticketId: number, payload?: ApproveTicketPayload): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${ticketId}/approve/`, payload ?? {});
    return response.data;
  },

  rejectTicket: async (ticketId: number, payload: RejectTicketPayload): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${ticketId}/reject/`, payload);
    return response.data;
  },

  bulkStatusUpdate: async (data: BulkStatusUpdatePayload): Promise<{ updated: number }> => {
    const response = await apiClient.post('/tickets/bulk-status-update/', data);
    return response.data;
  },

  getTicketComments: async (ticketId: number) => {
    const response = await apiClient.get(`/tickets/${ticketId}/comments/`);
    return response.data;
  },

  addTicketComment: async (ticketId: number, text: string) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments/`, { text });
    return response.data;
  },

  getTicketFeedback: async (ticketId: number) => {
    const response = await apiClient.get(`/tickets/${ticketId}/feedback/`);
    return response.data;
  },

  addTicketFeedback: async (ticketId: number, rating: number, comment?: string) => {
    const response = await apiClient.post(`/tickets/${ticketId}/feedback/`, { rating, comment });
    return response.data;
  },
};

export default ticketsService;
