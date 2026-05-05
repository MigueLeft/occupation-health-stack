import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { psychometricTestsService } from '../services/sub-entities.service';
import type { PsychometricPayload } from '../services/sub-entities.service';

export function useAddPsychometricTest(consultationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PsychometricPayload) => psychometricTestsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['psychometric-tests', consultationId] }),
    onError: () => toast.error('Error al agregar el test psicométrico'),
  });
}

export function useRemovePsychometricTest(consultationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => psychometricTestsService.remove(testId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['psychometric-tests', consultationId] }),
    onError: () => toast.error('Error al eliminar el test psicométrico'),
  });
}
