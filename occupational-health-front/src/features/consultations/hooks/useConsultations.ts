import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { consultationsService } from '../services/consultations.service';
import { requestsService } from '@/features/requests/services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import type { ConsultationWithDetails, CreateConsultationPayload, UpdateConsultationPayload } from '../types';
import type { EvaluationReason, RequestStatus } from '@/features/requests/types';

export const CONSULTATIONS_KEY = ['consultations'] as const;
const REQUESTS_KEY = ['requests'] as const;
const PATIENTS_KEY = ['patients'] as const;

export function useConsultations() {
  const consultationsQ = useQuery({ queryKey: CONSULTATIONS_KEY, queryFn: () => consultationsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true });
  const requestsQ = useQuery({ queryKey: REQUESTS_KEY, queryFn: () => requestsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true });
  const patientsQ = useQuery({ queryKey: PATIENTS_KEY, queryFn: () => patientsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true });

  const isLoading = consultationsQ.isLoading || requestsQ.isLoading || patientsQ.isLoading;

  const data: ConsultationWithDetails[] | undefined =
    consultationsQ.data && requestsQ.data && patientsQ.data
      ? consultationsQ.data.consultations.map((c) => {
          const req = requestsQ.data.requests.find((r) => r.id === c.requestId);
          const patient = req ? patientsQ.data.patients.find((p) => p.cedula === req.patientId) : null;
          return {
            ...c,
            requestDate: req?.requestDate ?? '',
            evaluationReason: (req?.evaluationReason ?? '') as EvaluationReason,
            requestStatus: (req?.status ?? 'Pendiente') as RequestStatus,
            patientId: req?.patientId ?? '',
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : (req?.patientId ?? ''),
          } as ConsultationWithDetails;
        })
      : undefined;

  return { data, isLoading };
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConsultationPayload) => consultationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      toast.success('Consulta creada exitosamente.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Error al crear la consulta');
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateConsultationPayload }) =>
      consultationsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      toast.success('Consulta actualizada.');
    },
    onError: () => {
      toast.error('Error al actualizar la consulta');
    },
  });
}
