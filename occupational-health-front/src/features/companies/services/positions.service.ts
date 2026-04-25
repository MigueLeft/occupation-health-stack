import { apiClient } from '@/lib/axios';
import type { Position, CreatePositionPayload, UpdatePositionPayload } from '../types';

export const positionsService = {
  async create(payload: CreatePositionPayload): Promise<{ position: Position }> {
    const { data } = await apiClient.post<{ position: Position }>('/positions', payload);
    return data;
  },

  async update(id: string, payload: UpdatePositionPayload): Promise<{ position: Position }> {
    const { data } = await apiClient.patch<{ position: Position }>(`/positions/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ position: Position }> {
    const { data } = await apiClient.delete<{ position: Position }>(`/positions/${id}`);
    return data;
  },
};
