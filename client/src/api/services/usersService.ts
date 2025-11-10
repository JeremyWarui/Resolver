import apiClient from '../client';
import type { User, CreateUserPayload, UsersResponse } from '@/types';

const usersService = {
  // Get all users
  getUsers: async (params?: { role?: string; sections?: number; page?: number; page_size?: number }): Promise<UsersResponse> => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },

  // Get single user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },

  // Get current logged-in user
  getCurrentUser: async (): Promise<User> => {
    // You'll need to implement a /users/me/ endpoint or use session data
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  // Create a new user
  createUser: async (data: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post('/users/', data);
    return response.data;
  },

  // Update a user
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}/`);
  },
};

export default usersService;
