import { apiClient } from '@/lib/axios';
import type { AppRequest, CreateRequestPayload, UpdateRequestPayload } from '../types';

export const requestsService = {
  async getAll(patientId?: string): Promise<{ requests: AppRequest[] }> {
    const { data } = await apiClient.get<{ requests: AppRequest[] }>('/requests', {
      params: patientId ? { patientId } : {},
    });
    return data;
  },

  async create(payload: CreateRequestPayload): Promise<{ request: AppRequest }> {
    const { data } = await apiClient.post<{ request: AppRequest }>('/requests', payload);
    return data;
  },

  async update(id: string, payload: UpdateRequestPayload): Promise<{ request: AppRequest }> {
    const { data } = await apiClient.patch<{ request: AppRequest }>(`/requests/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ request: AppRequest }> {
    const { data } = await apiClient.delete<{ request: AppRequest }>(`/requests/${id}`);
    return data;
  },
};
