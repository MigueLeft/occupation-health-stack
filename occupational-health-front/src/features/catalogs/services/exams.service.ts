import { apiClient } from '@/lib/axios';
import type { Exam } from '../types';

type Payload = { name: string; category: string };
type R<T> = Promise<{ exam: T }>;

export const examsService = {
  getAll: async (): Promise<{ exams: Exam[] }> => (await apiClient.get('/exams')).data,
  create: async (p: Payload): R<Exam> => (await apiClient.post('/exams', p)).data,
  update: async (id: string, p: Partial<Payload>): R<Exam> => (await apiClient.patch(`/exams/${id}`, p)).data,
  remove: async (id: string): R<Exam> => (await apiClient.delete(`/exams/${id}`)).data,
};
