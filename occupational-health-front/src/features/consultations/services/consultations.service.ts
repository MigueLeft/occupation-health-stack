import { apiClient } from '@/lib/axios';
import type { Consultation, CreateConsultationPayload, UpdateConsultationPayload } from '../types';

export const consultationsService = {
  async getAll(): Promise<{ consultations: Consultation[] }> {
    const { data } = await apiClient.get<{ consultations: Consultation[] }>('/consultations');
    return data;
  },

  async create(payload: CreateConsultationPayload): Promise<{ consultation: Consultation }> {
    const { data } = await apiClient.post<{ consultation: Consultation }>('/consultations', payload);
    return data;
  },

  async update(id: string, payload: UpdateConsultationPayload): Promise<{ consultation: Consultation }> {
    const { data } = await apiClient.patch<{ consultation: Consultation }>(`/consultations/${id}`, payload);
    return data;
  },
};
