import { apiClient } from '@/lib/axios';
import type { Disease } from '../types';

type Payload = { name: string; isChronic?: boolean };
type R<T> = Promise<{ disease: T }>;

export const diseasesService = {
  getAll: async (): Promise<{ diseases: Disease[] }> => (await apiClient.get('/diseases')).data,
  create: async (p: Payload): R<Disease> => (await apiClient.post('/diseases', p)).data,
  update: async (id: string, p: Partial<Payload>): R<Disease> => (await apiClient.patch(`/diseases/${id}`, p)).data,
  remove: async (id: string): R<Disease> => (await apiClient.delete(`/diseases/${id}`)).data,
};
