import { apiClient } from '@/lib/axios';
import type { PsychologicalIndicator, PsychologicalIndicatorValue } from '../types';

type IndicatorResponse = { indicator: PsychologicalIndicator };
type ValueResponse = { indicatorValue: PsychologicalIndicatorValue };

export const psychologicalIndicatorsService = {
  getAll: async (): Promise<{ indicators: PsychologicalIndicator[] }> =>
    (await apiClient.get('/psychological-indicators')).data,

  createIndicator: async (payload: { name: string; sortOrder?: number }): Promise<IndicatorResponse> =>
    (await apiClient.post('/psychological-indicators', payload)).data,

  updateIndicator: async (
    id: string,
    payload: Partial<{ name: string; sortOrder: number; isActive: boolean }>,
  ): Promise<IndicatorResponse> =>
    (await apiClient.patch(`/psychological-indicators/${id}`, payload)).data,

  deleteIndicator: async (id: string): Promise<IndicatorResponse> =>
    (await apiClient.delete(`/psychological-indicators/${id}`)).data,

  createValue: async (
    indicatorId: string,
    payload: { name: string; sortOrder?: number },
  ): Promise<ValueResponse> =>
    (await apiClient.post(`/psychological-indicators/${indicatorId}/values`, payload)).data,

  updateValue: async (
    indicatorId: string,
    valueId: string,
    payload: Partial<{ name: string; sortOrder: number; isActive: boolean }>,
  ): Promise<ValueResponse> =>
    (await apiClient.patch(`/psychological-indicators/${indicatorId}/values/${valueId}`, payload)).data,

  deleteValue: async (indicatorId: string, valueId: string): Promise<ValueResponse> =>
    (await apiClient.delete(`/psychological-indicators/${indicatorId}/values/${valueId}`)).data,
};
