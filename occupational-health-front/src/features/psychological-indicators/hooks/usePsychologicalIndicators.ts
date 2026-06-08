import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { psychologicalIndicatorsService } from '../services/psychological-indicators.service';

const KEY = ['psychological-indicators'] as const;

export function usePsychologicalIndicators() {
  return useQuery({
    queryKey: KEY,
    queryFn: psychologicalIndicatorsService.getAll,
    select: (d) => d.indicators,
  });
}

export function useCreatePsychologicalIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psychologicalIndicatorsService.createIndicator,
    onSuccess: ({ indicator }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(`Indicador "${indicator.name}" creado.`);
    },
    onError: () => toast.error('Error al crear el indicador'),
  });
}

export function useUpdatePsychologicalIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; sortOrder: number; isActive: boolean }> }) =>
      psychologicalIndicatorsService.updateIndicator(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Indicador actualizado.');
    },
    onError: () => toast.error('Error al actualizar el indicador'),
  });
}

export function useDeletePsychologicalIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psychologicalIndicatorsService.deleteIndicator,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Indicador eliminado.');
    },
    onError: () => toast.error('Error al eliminar el indicador'),
  });
}

export function useCreateIndicatorValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ indicatorId, payload }: { indicatorId: string; payload: { name: string; sortOrder?: number } }) =>
      psychologicalIndicatorsService.createValue(indicatorId, payload),
    onSuccess: ({ indicatorValue }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(`Valor "${indicatorValue.name}" agregado.`);
    },
    onError: () => toast.error('Error al crear el valor'),
  });
}

export function useUpdateIndicatorValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ indicatorId, valueId, payload }: { indicatorId: string; valueId: string; payload: Partial<{ name: string; sortOrder: number; isActive: boolean }> }) =>
      psychologicalIndicatorsService.updateValue(indicatorId, valueId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Valor actualizado.');
    },
    onError: () => toast.error('Error al actualizar el valor'),
  });
}

export function useDeleteIndicatorValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ indicatorId, valueId }: { indicatorId: string; valueId: string }) =>
      psychologicalIndicatorsService.deleteValue(indicatorId, valueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Valor eliminado.');
    },
    onError: () => toast.error('Error al eliminar el valor'),
  });
}
