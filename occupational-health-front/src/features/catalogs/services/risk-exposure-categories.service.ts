import { apiClient } from '@/lib/axios';
import type { RiskExposureCategory } from '../types';

export type RiskExposureCategoryCreatePayload = {
  name: string;
  riskType: string;
  healthEffects?: string;
};

export type RiskExposureCategoryUpdatePayload = {
  healthEffects?: string;
};

type R<T> = Promise<{ riskExposureCategory: T }>;

export const riskExposureCategoriesService = {
  getAll: async (): Promise<{ riskExposureCategories: RiskExposureCategory[] }> =>
    (await apiClient.get('/risk-exposure-categories')).data,
  create: async (p: RiskExposureCategoryCreatePayload): R<RiskExposureCategory> =>
    (await apiClient.post('/risk-exposure-categories', p)).data,
  update: async (id: string, p: RiskExposureCategoryUpdatePayload): R<RiskExposureCategory> =>
    (await apiClient.patch(`/risk-exposure-categories/${id}`, p)).data,
};
