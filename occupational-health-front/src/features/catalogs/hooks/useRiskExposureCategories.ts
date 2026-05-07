import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { riskExposureCategoriesService, type RiskExposureCategoryPayload } from '../services/risk-exposure-categories.service';

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
    mutationFn: riskExposureCategoriesService.create,
    onSuccess: ({ riskExposureCategory }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(`Categoría "${riskExposureCategory.name}" agregada.`);
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Error al crear la categoría'),
  });
}

export function useUpdateRiskExposureCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RiskExposureCategoryPayload> }) =>
      riskExposureCategoriesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Categoría actualizada.');
    },
    onError: () => toast.error('Error al actualizar la categoría'),
  });
}

export function useDeleteRiskExposureCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: riskExposureCategoriesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Categoría eliminada.');
    },
    onError: () => toast.error('Error al eliminar la categoría'),
  });
}
