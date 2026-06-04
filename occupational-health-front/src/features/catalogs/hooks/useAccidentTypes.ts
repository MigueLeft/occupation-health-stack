import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accidentTypesService } from '../services/accident-types.service';
import type { AccidentType } from '../services/accident-types.service';

const KEY = ['accident-types'] as const;

export function useAccidentTypes() {
  return useQuery({
    queryKey: KEY,
    queryFn: accidentTypesService.getAll,
    select: (d) => d.accidentTypes,
  });
}

export function useCreateAccidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accidentTypesService.create,
    onSuccess: ({ accidentType }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(`Tipo de accidente "${accidentType.name}" agregado.`);
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Error al crear el tipo de accidente'),
  });
}

export function useUpdateAccidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      accidentTypesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Tipo de accidente actualizado.');
    },
    onError: () => toast.error('Error al actualizar el tipo de accidente'),
  });
}

export function useDeleteAccidentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accidentTypesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Tipo de accidente eliminado.');
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Error al eliminar el tipo de accidente'),
  });
}

export type { AccidentType };
