import { apiClient } from '@/lib/axios';
import type { RestPeriod } from '../types';

export const restPeriodsService = {
  async create(payload: {
    consultationId: string;
    requiresRest: boolean;
    days?: number;
    reason?: string;
    diseaseId?: string;
  }): Promise<RestPeriod> {
    const { data } = await apiClient.post<{ restPeriod: RestPeriod }>('/rest-periods', payload);
    return data.restPeriod;
  },

  async update(id: string, payload: {
    requiresRest?: boolean;
    days?: number | null;
    reason?: string | null;
    diseaseId?: string | null;
  }): Promise<RestPeriod> {
    const { data } = await apiClient.patch<{ restPeriod: RestPeriod }>(`/rest-periods/${id}`, payload);
    return data.restPeriod;
  },
};
