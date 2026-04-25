import { apiClient } from '@/lib/axios';
import type { Role, PermissionsMatrix, SystemModule } from '../types';

export const rolesService = {
  async getAll(includeHidden = false): Promise<Role[]> {
    const { data } = await apiClient.get<Role[]>('/roles', {
      params: includeHidden ? { includeHidden: 'true' } : {},
    });
    return data;
  },

  async getOne(id: string): Promise<Role> {
    const { data } = await apiClient.get<Role>(`/roles/${id}`);
    return data;
  },

  async getModules(): Promise<SystemModule[]> {
    const { data } = await apiClient.get<SystemModule[]>('/roles/modules');
    return data;
  },

  async create(payload: { name: string; description?: string }): Promise<{ role: Role }> {
    const { data } = await apiClient.post<{ role: Role }>('/roles', payload);
    return data;
  },

  async updatePermissions(id: string, permissions: PermissionsMatrix): Promise<{ role: Role }> {
    const { data } = await apiClient.put<{ role: Role }>(`/roles/${id}/permissions`, {
      permissions,
    });
    return data;
  },

  async update(
    id: string,
    payload: { name?: string; description?: string },
  ): Promise<{ role: Role }> {
    const { data } = await apiClient.patch<{ role: Role }>(`/roles/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/roles/${id}`);
    return data;
  },
};
