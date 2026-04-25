import { apiClient } from '@/lib/axios';
import type { Company } from '../types';

export const companiesService = {
  async getAll(): Promise<{ companies: Company[] }> {
    const { data } = await apiClient.get<{ companies: Company[] }>('/companies');
    return data;
  },
};
