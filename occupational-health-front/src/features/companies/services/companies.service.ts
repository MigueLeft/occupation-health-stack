import { apiClient } from '@/lib/axios';
import type { CompanyWithPositions, CreateCompanyPayload, UpdateCompanyPayload } from '../types';

export const companiesService = {
  async getAll(): Promise<{ companies: CompanyWithPositions[] }> {
    const { data } = await apiClient.get<{ companies: CompanyWithPositions[] }>('/companies');
    return data;
  },

  async getOne(id: string): Promise<{ company: CompanyWithPositions }> {
    const { data } = await apiClient.get<{ company: CompanyWithPositions }>(`/companies/${id}`);
    return data;
  },

  async create(payload: CreateCompanyPayload): Promise<{ company: CompanyWithPositions }> {
    const { data } = await apiClient.post<{ company: CompanyWithPositions }>('/companies', payload);
    return data;
  },

  async update(id: string, payload: UpdateCompanyPayload): Promise<{ company: CompanyWithPositions }> {
    const { data } = await apiClient.patch<{ company: CompanyWithPositions }>(`/companies/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ company: CompanyWithPositions }> {
    const { data } = await apiClient.delete<{ company: CompanyWithPositions }>(`/companies/${id}`);
    return data;
  },
};
