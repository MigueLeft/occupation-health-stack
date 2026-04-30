import { apiClient } from '@/lib/axios';
import type { PsychometricTest } from '../types';

type Payload = { name: string };
type R<T> = Promise<{ psychometricTest: T }>;

export const psychometricTestsService = {
  getAll: async (): Promise<{ psychometricTestCatalog: PsychometricTest[] }> =>
    (await apiClient.get('/psychometric-test-catalog')).data,
  create: async (p: Payload): R<PsychometricTest> =>
    (await apiClient.post('/psychometric-test-catalog', p)).data,
  update: async (id: string, p: Partial<Payload>): R<PsychometricTest> =>
    (await apiClient.patch(`/psychometric-test-catalog/${id}`, p)).data,
  remove: async (id: string): R<PsychometricTest> =>
    (await apiClient.delete(`/psychometric-test-catalog/${id}`)).data,
};
