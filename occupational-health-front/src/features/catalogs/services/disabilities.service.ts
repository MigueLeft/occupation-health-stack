import { apiClient } from '@/lib/axios';
import type { Disability } from '../types';

type R<T> = Promise<{ disability: T }>;

export const disabilitiesService = {
  getAll: async (): Promise<{ disabilities: Disability[] }> => (await apiClient.get('/disabilities')).data,
  create: async (p: { name: string }): R<Disability> => (await apiClient.post('/disabilities', p)).data,
  update: async (id: string, p: { name: string }): R<Disability> => (await apiClient.patch(`/disabilities/${id}`, p)).data,
  remove: async (id: string): R<Disability> => (await apiClient.delete(`/disabilities/${id}`)).data,
};
