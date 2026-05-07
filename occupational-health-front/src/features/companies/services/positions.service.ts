import { apiClient } from '@/lib/axios';
import type { Position, CreatePositionPayload, UpdatePositionPayload, PositionRisk } from '../types';

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

  async addRisk(positionId: string, riskId: string): Promise<{ risks: PositionRisk[] }> {
    const { data } = await apiClient.post<{ risks: PositionRisk[] }>(`/positions/${positionId}/risks/${riskId}`);
    return data;
  },

  async removeRisk(positionId: string, riskId: string): Promise<{ risks: PositionRisk[] }> {
    const { data } = await apiClient.delete<{ risks: PositionRisk[] }>(`/positions/${positionId}/risks/${riskId}`);
    return data;
  },
};
