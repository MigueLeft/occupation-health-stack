import { apiClient } from '@/lib/axios';
import type { ConsultationDisability } from '../types';

export const consultationDisabilitiesService = {
  async getByConsultation(consultationId: string): Promise<ConsultationDisability[]> {
    const { data } = await apiClient.get<{ consultationDisabilities: ConsultationDisability[] }>(
      '/consultation-disabilities',
      { params: { consultationId } },
    );
    return data.consultationDisabilities ?? [];
  },

  async getByPatient(patientCedula: string): Promise<{ id: string; name: string }[]> {
    const { data } = await apiClient.get<{ disabilities: { id: string; name: string }[] }>(
      '/consultation-disabilities',
      { params: { patientCedula } },
    );
    return data.disabilities ?? [];
  },

  async add(payload: { consultationId: string; disabilityId: string }): Promise<ConsultationDisability> {
    const { data } = await apiClient.post<{ consultationDisability: ConsultationDisability }>(
      '/consultation-disabilities',
      payload,
    );
    return data.consultationDisability;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/consultation-disabilities/${id}`);
  },
};
