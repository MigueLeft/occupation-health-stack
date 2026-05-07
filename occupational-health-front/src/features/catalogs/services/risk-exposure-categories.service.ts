import { apiClient } from '@/lib/axios';
import type { RiskExposureCategory } from '../types';

export type RiskExposureCategoryPayload = {
  name: string;
  riskType: string;
  conditions?: string;
  healthEffects?: string;
};

type R<T> = Promise<{ riskExposureCategory: T }>;

export const riskExposureCategoriesService = {
  getAll: async (): Promise<{ riskExposureCategories: RiskExposureCategory[] }> =>
    (await apiClient.get('/risk-exposure-categories')).data,
  create: async (p: RiskExposureCategoryPayload): R<RiskExposureCategory> =>
    (await apiClient.post('/risk-exposure-categories', p)).data,
  update: async (id: string, p: Partial<RiskExposureCategoryPayload>): R<RiskExposureCategory> =>
    (await apiClient.patch(`/risk-exposure-categories/${id}`, p)).data,
  remove: async (id: string): R<RiskExposureCategory> =>
    (await apiClient.delete(`/risk-exposure-categories/${id}`)).data,
};
