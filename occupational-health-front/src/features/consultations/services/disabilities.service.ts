import { apiClient } from '@/lib/axios';
import type { ConsultationDisability } from '../types';

export const consultationDisabilitiesService = {
  async getByConsultation(consultationId: string): Promise<ConsultationDisability | null> {
    const { data } = await apiClient.get<{ consultationDisability: ConsultationDisability | null }>(
      '/consultation-disabilities',
      { params: { consultationId } },
    );
    return data.consultationDisability;
  },

  async upsert(payload: {
    consultationId: string;
    hasDisability: boolean;
    disabilityId?: string;
  }): Promise<ConsultationDisability> {
    const { data } = await apiClient.post<{ consultationDisability: ConsultationDisability }>(
      '/consultation-disabilities',
      payload,
    );
    return data.consultationDisability;
  },
};
