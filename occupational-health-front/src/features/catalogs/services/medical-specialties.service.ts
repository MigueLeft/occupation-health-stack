import { apiClient } from '@/lib/axios';
import type { MedicalSpecialty } from '../types';

type Payload = { name: string };
type R<T> = Promise<{ medicalSpecialty: T }>;

export const medicalSpecialtiesService = {
  getAll: async (): Promise<{ medicalSpecialties: MedicalSpecialty[] }> =>
    (await apiClient.get('/medical-specialties')).data,
  create: async (p: Payload): R<MedicalSpecialty> =>
    (await apiClient.post('/medical-specialties', p)).data,
  update: async (id: string, p: Partial<Payload>): R<MedicalSpecialty> =>
    (await apiClient.patch(`/medical-specialties/${id}`, p)).data,
  remove: async (id: string): R<MedicalSpecialty> =>
    (await apiClient.delete(`/medical-specialties/${id}`)).data,
};
