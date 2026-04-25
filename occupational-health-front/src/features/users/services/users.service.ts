import { apiClient } from '@/lib/axios';
import type { AppUser, CreateUserPayload, UpdateUserPayload } from '../types';

export const usersService = {
  async getAll(): Promise<{ users: AppUser[] }> {
    const { data } = await apiClient.get<{ users: AppUser[] }>('/users');
    return data;
  },

  async create(payload: CreateUserPayload): Promise<{ user: AppUser }> {
    const { data } = await apiClient.post<{ user: AppUser }>('/users', payload);
    return data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<{ user: AppUser }> {
    const { data } = await apiClient.patch<{ user: AppUser }>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/users/${id}`);
    return data;
  },
};
