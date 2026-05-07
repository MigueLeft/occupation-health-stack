import { apiClient } from '@/lib/axios';
import type { ConsultationReferral } from '../types';

export const referralsService = {
  async getByConsultation(consultationId: string): Promise<ConsultationReferral | null> {
    const { data } = await apiClient.get<{ consultationReferral: ConsultationReferral | null }>(
      '/consultation-referrals',
      { params: { consultationId } },
    );
    return data.consultationReferral;
  },

  async upsert(payload: {
    consultationId: string;
    requiresReferral: boolean;
    specialtyId?: string;
  }): Promise<ConsultationReferral> {
    const { data } = await apiClient.post<{ consultationReferral: ConsultationReferral }>(
      '/consultation-referrals',
      payload,
    );
    return data.consultationReferral;
  },
};
