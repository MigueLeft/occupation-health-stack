import { apiClient } from '@/lib/axios';
import type { Risk } from '../types';

type Payload = { name: string; type: string };
type R<T> = Promise<{ risk: T }>;

export const risksService = {
  getAll: async (): Promise<{ risks: Risk[] }> => (await apiClient.get('/risks')).data,
  create: async (p: Payload): R<Risk> => (await apiClient.post('/risks', p)).data,
  update: async (id: string, p: Partial<Payload>): R<Risk> => (await apiClient.patch(`/risks/${id}`, p)).data,
  remove: async (id: string): R<Risk> => (await apiClient.delete(`/risks/${id}`)).data,
};
