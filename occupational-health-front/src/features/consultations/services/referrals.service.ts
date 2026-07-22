import { apiClient } from '@/lib/axios';
import type { ConsultationReferral } from '../types';

export const referralsService = {
  async getByConsultation(consultationId: string): Promise<ConsultationReferral[]> {
    const { data } = await apiClient.get<{ consultationReferrals: ConsultationReferral[] }>(
      '/consultation-referrals',
      { params: { consultationId } },
    );
    return data.consultationReferrals ?? [];
  },

  async add(payload: { consultationId: string; specialtyId: string }): Promise<ConsultationReferral> {
    const { data } = await apiClient.post<{ consultationReferral: ConsultationReferral }>(
      '/consultation-referrals',
      payload,
    );
    return data.consultationReferral;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/consultation-referrals/${id}`);
  },
};
