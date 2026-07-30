import { apiClient } from '@/lib/axios';
import type { Patient, CreatePatientPayload, UpdatePatientPayload } from '../types';

export const patientsService = {
  async getAll(): Promise<{ patients: Patient[] }> {
    const { data } = await apiClient.get<{ patients: Patient[] }>('/patients');
    return data;
  },

  async getOne(cedula: string): Promise<{ patient: Patient }> {
    const { data } = await apiClient.get<{ patient: Patient }>(`/patients/${cedula}`);
    return data;
  },

  async create(payload: CreatePatientPayload): Promise<{ patient: Patient }> {
    const { data } = await apiClient.post<{ patient: Patient }>('/patients', payload);
    return data;
  },

  async update(cedula: string, payload: UpdatePatientPayload): Promise<{ patient: Patient }> {
    const { data } = await apiClient.patch<{ patient: Patient }>(`/patients/${cedula}`, payload);
    return data;
  },

  async remove(cedula: string): Promise<{ patient: Patient }> {
    const { data } = await apiClient.delete<{ patient: Patient }>(`/patients/${cedula}`);
    return data;
  },

  async reactivate(cedula: string): Promise<{ patient: Patient }> {
    const { data } = await apiClient.patch<{ patient: Patient }>(`/patients/${cedula}/reactivate`);
    return data;
  },

  async backfillExEmployees(): Promise<{ updated: number }> {
    const { data } = await apiClient.post<{ updated: number }>('/patients/backfill-ex-employees');
    return data;
  },
};
