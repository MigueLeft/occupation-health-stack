import { apiClient } from '@/lib/axios';
import type { Position } from '../types';

export const positionsService = {
  async getAll(companyId?: string): Promise<{ positions: Position[] }> {
    const params = companyId ? { companyId } : {};
    const { data } = await apiClient.get<{ positions: Position[] }>('/positions', { params });
    return data;
  },
};
