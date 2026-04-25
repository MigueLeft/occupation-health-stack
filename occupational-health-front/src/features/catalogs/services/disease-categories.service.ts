import { apiClient } from '@/lib/axios';

export interface DiseaseCategory { id: string; name: string; }

export const diseaseCategoriesService = {
  async getAll(): Promise<{ diseaseCategories: DiseaseCategory[] }> {
    const { data } = await apiClient.get<{ diseaseCategories: DiseaseCategory[] }>('/disease-categories');
    return data;
  },
  async create(name: string): Promise<{ diseaseCategory: DiseaseCategory }> {
    const { data } = await apiClient.post<{ diseaseCategory: DiseaseCategory }>('/disease-categories', { name });
    return data;
  },
  async update(id: string, name: string): Promise<{ diseaseCategory: DiseaseCategory }> {
    const { data } = await apiClient.patch<{ diseaseCategory: DiseaseCategory }>(`/disease-categories/${id}`, { name });
    return data;
  },
  async remove(id: string): Promise<{ diseaseCategory: DiseaseCategory }> {
    const { data } = await apiClient.delete<{ diseaseCategory: DiseaseCategory }>(`/disease-categories/${id}`);
    return data;
  },
};
