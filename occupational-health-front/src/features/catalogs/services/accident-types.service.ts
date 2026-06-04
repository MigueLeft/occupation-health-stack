import { apiClient } from '@/lib/axios';

export interface AccidentType { id: string; name: string; }

type R<T> = Promise<{ accidentType: T }>;

export const accidentTypesService = {
  getAll: async (): Promise<{ accidentTypes: AccidentType[] }> =>
    (await apiClient.get('/accident-types')).data,
  create: async (p: { name: string }): R<AccidentType> =>
    (await apiClient.post('/accident-types', p)).data,
  update: async (id: string, p: { name: string }): R<AccidentType> =>
    (await apiClient.patch(`/accident-types/${id}`, p)).data,
  remove: async (id: string): R<AccidentType> =>
    (await apiClient.delete(`/accident-types/${id}`)).data,
};
