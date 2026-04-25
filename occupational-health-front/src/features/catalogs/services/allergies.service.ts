import { apiClient } from '@/lib/axios';
import type { Allergy } from '../types';

type R<T> = Promise<{ allergy: T }>;

export const allergiesService = {
  getAll: async (): Promise<{ allergies: Allergy[] }> => (await apiClient.get('/allergies')).data,
  create: async (p: { name: string }): R<Allergy> => (await apiClient.post('/allergies', p)).data,
  update: async (id: string, p: { name: string }): R<Allergy> => (await apiClient.patch(`/allergies/${id}`, p)).data,
  remove: async (id: string): R<Allergy> => (await apiClient.delete(`/allergies/${id}`)).data,
};
