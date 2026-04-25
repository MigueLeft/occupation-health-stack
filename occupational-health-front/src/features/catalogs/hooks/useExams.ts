import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examsService } from '../services/exams.service';

const KEY = ['exams'] as const;

export function useExams() {
  return useQuery({ queryKey: KEY, queryFn: examsService.getAll, select: (d) => d.exams });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examsService.create,
    onSuccess: ({ exam }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Examen "${exam.name}" agregado.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear el examen'),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; category?: string } }) =>
      examsService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Examen actualizado.'); },
    onError: () => toast.error('Error al actualizar el examen'),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Examen eliminado.'); },
    onError: () => toast.error('Error al eliminar el examen'),
  });
}
