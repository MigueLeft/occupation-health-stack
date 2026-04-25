import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { psychometricTestsService } from '../services/psychometric-tests.service';

const KEY = ['psychometric-tests'] as const;

export function usePsychometricTests() {
  return useQuery({
    queryKey: KEY,
    queryFn: psychometricTestsService.getAll,
    select: (d) => d.psychometricTestCatalog,
  });
}

export function useCreatePsychometricTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psychometricTestsService.create,
    onSuccess: ({ psychometricTest }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Test "${psychometricTest.name}" agregado.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear el test'),
  });
}

export function useUpdatePsychometricTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; interpretations?: string[] } }) =>
      psychometricTestsService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Test actualizado.'); },
    onError: () => toast.error('Error al actualizar el test'),
  });
}

export function useDeletePsychometricTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: psychometricTestsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Test eliminado.'); },
    onError: () => toast.error('Error al eliminar el test'),
  });
}
