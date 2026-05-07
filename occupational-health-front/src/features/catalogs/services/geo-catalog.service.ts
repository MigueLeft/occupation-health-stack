import { apiClient } from '@/lib/axios';
import type { GeoLocation } from '../types';

export const geoCatalogService = {
  async getAll(type?: string): Promise<GeoLocation[]> {
    const params = type ? { type } : undefined;
    const { data } = await apiClient.get<{ geoLocations: GeoLocation[] }>('/geo-catalog', { params });
    return data.geoLocations;
  },

  async create(payload: { name: string; type: string }): Promise<GeoLocation> {
    const { data } = await apiClient.post<{ geoLocation: GeoLocation }>('/geo-catalog', payload);
    return data.geoLocation;
  },

  async update(id: string, payload: { name?: string; type?: string }): Promise<GeoLocation> {
    const { data } = await apiClient.patch<{ geoLocation: GeoLocation }>(`/geo-catalog/${id}`, payload);
    return data.geoLocation;
  },

  async remove(id: string): Promise<GeoLocation> {
    const { data } = await apiClient.delete<{ geoLocation: GeoLocation }>(`/geo-catalog/${id}`);
    return data.geoLocation;
  },
};
