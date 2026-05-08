import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  riskExposureCategoriesService,
  type RiskExposureCategoryCreatePayload,
  type RiskExposureCategoryUpdatePayload,
} from '../services/risk-exposure-categories.service';

const KEY = ['risk-exposure-categories'] as const;

export function useRiskExposureCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: riskExposureCategoriesService.getAll,
    select: (d) => d.riskExposureCategories,
  });
}

export function useCreateRiskExposureCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RiskExposureCategoryCreatePayload) =>
      riskExposureCategoriesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Error al guardar el tipo de riesgo'),
  });
}

export function useUpdateRiskExposureCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RiskExposureCategoryUpdatePayload }) =>
      riskExposureCategoriesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Efectos en la salud actualizados.');
    },
    onError: () => toast.error('Error al actualizar el tipo de riesgo'),
  });
}
