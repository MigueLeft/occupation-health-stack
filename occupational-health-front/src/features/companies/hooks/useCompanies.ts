import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companiesService } from '../services/companies.service';
import type { CreateCompanyPayload, UpdateCompanyPayload } from '../types';

export const COMPANIES_KEY = ['companies'] as const;

export function useCompanies() {
  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: () => companiesService.getAll(),
    select: (data) => data.companies,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companiesService.create(payload),
    onSuccess: ({ company }) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success(`Empresa "${company.name}" creada exitosamente.`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al crear la empresa');
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      companiesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success('Empresa actualizada correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al actualizar la empresa');
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success('Empresa eliminada correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al eliminar la empresa');
    },
  });
}
