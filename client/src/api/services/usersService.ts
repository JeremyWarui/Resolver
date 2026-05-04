import apiClient from '../client';
import type { User, CreateUserPayload, UsersResponse } from '@/types';

const usersService = {
  getUsers: async (params?: { role?: string; sections?: number; page?: number; page_size?: number }): Promise<UsersResponse> => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },

  createUser: async (data: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post('/users/', data);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}/`);
  },

  getAssignableUsers: async (params?: { section_id?: number }): Promise<{ results: User[] }> => {
    const response = await apiClient.get('/assignable-users/', { params });
    return response.data;
  },
};

export default usersService;
