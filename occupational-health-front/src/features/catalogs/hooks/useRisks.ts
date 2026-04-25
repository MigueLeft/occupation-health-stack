import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { risksService } from '../services/risks.service';

const KEY = ['risks'] as const;

export function useRisks() {
  return useQuery({ queryKey: KEY, queryFn: risksService.getAll, select: (d) => d.risks });
}

export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: risksService.create,
    onSuccess: ({ risk }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Riesgo "${risk.name}" agregado.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear el riesgo'),
  });
}

export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; type?: string } }) =>
      risksService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Riesgo actualizado.'); },
    onError: () => toast.error('Error al actualizar el riesgo'),
  });
}

export function useDeleteRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: risksService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Riesgo eliminado.'); },
    onError: () => toast.error('Error al eliminar el riesgo'),
  });
}
