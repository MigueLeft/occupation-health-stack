import { apiClient } from '@/lib/axios';
import type { BodySystem } from '../types';

type R<T> = Promise<{ bodySystem: T }>;

export const bodySystemsService = {
  getAll: async (): Promise<{ bodySystems: BodySystem[] }> => (await apiClient.get('/body-systems')).data,
  create: async (p: { name: string }): R<BodySystem> => (await apiClient.post('/body-systems', p)).data,
  update: async (id: string, p: { name: string }): R<BodySystem> => (await apiClient.patch(`/body-systems/${id}`, p)).data,
  remove: async (id: string): R<BodySystem> => (await apiClient.delete(`/body-systems/${id}`)).data,
};
