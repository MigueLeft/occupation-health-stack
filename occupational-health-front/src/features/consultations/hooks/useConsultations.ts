import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { consultationsService } from '../services/consultations.service';
import { requestsService } from '@/features/requests/services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { usePermissions } from '@/features/auth';
import type { ConsultationWithDetails, CreateConsultationPayload, UpdateConsultationPayload } from '../types';
import type { EvaluationReason, RequestStatus } from '@/features/requests/types';

export const CONSULTATIONS_KEY = ['consultations'] as const;
const REQUESTS_KEY = ['requests'] as const;
const PATIENTS_KEY = ['patients'] as const;

export function useConsultations() {
  const { can } = usePermissions();
  const hasRequestsPerm = can('requests', 'view');
  const hasPatientsPerm = can('patients', 'view');

  const consultationsQ = useQuery({ queryKey: CONSULTATIONS_KEY, queryFn: () => consultationsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true });
  const requestsQ = useQuery({ queryKey: REQUESTS_KEY, queryFn: () => requestsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true, enabled: hasRequestsPerm });
  const patientsQ = useQuery({ queryKey: PATIENTS_KEY, queryFn: () => patientsService.getAll(), refetchInterval: 30_000, refetchOnWindowFocus: true, enabled: hasPatientsPerm });

  // Solo consultas bloquean el spinner — requests/patients son datos suplementarios
  const isLoading = consultationsQ.isLoading;

  const data: ConsultationWithDetails[] | undefined =
    consultationsQ.data
      ? consultationsQ.data.consultations.map((c) => {
          const req = requestsQ.data?.requests.find((r) => r.id === c.requestId);
          const patient = req ? patientsQ.data?.patients.find((p) => p.cedula === req.patientId) : null;
          return {
            ...c,
            requestDate: req?.requestDate ?? c.requestDate ?? '',
            evaluationReason: (req?.evaluationReason ?? c.evaluationReason ?? '') as EvaluationReason,
            requestStatus: (req?.status ?? c.requestStatus ?? 'Pendiente') as RequestStatus,
            patientId: req?.patientId ?? c.patientId ?? '',
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : (c.patientName ?? req?.patientId ?? ''),
            companyName: patient?.company?.name ?? c.companyName ?? '',
            positionName: patient?.position?.name ?? c.positionName ?? '',
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
