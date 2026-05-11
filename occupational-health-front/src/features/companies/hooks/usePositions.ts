import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { positionsService } from '../services/positions.service';
import { COMPANIES_KEY } from './useCompanies';
import type { CreatePositionPayload, UpdatePositionPayload } from '../types';

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePositionPayload) => positionsService.create(payload),
    onSuccess: ({ position }) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success(`Cargo "${position.name}" creado exitosamente.`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al crear el cargo');
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePositionPayload }) =>
      positionsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Cargo actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el cargo');
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => positionsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Cargo eliminado correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al eliminar el cargo');
    },
  });
}

export function useAddPositionRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ positionId, riskId }: { positionId: string; riskId: string }) =>
      positionsService.addRisk(positionId, riskId),
    onSuccess: (_, { positionId }) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['position-risks', positionId] });
      toast.success('Riesgo agregado al cargo.');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al agregar el riesgo.');
    },
  });
}

export function useRemovePositionRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ positionId, riskId }: { positionId: string; riskId: string }) =>
      positionsService.removeRisk(positionId, riskId),
    onSuccess: (_, { positionId }) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['position-risks', positionId] });
      toast.success('Riesgo eliminado del cargo.');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al eliminar el riesgo.');
    },
  });
}
