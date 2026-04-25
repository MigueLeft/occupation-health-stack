import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { requestsService } from '@/features/requests/services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import type { Consultation, ConsultationWithDetails } from '../types';
import type { PhysicalExam, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '../services/sub-entities.service';
import type { EvaluationReason, RequestStatus } from '@/features/requests/types';
import type { Patient } from '@/features/patients/types';

interface FullConsultation extends ConsultationWithDetails {
  physicalExam: PhysicalExam | null;
  consultationDiagnostics: ConsultationDiagnostic[];
  examResults: ExamResult[];
  psychometricTests: PsychometricTestResult[];
  patientDiseases: { id: string; name: string }[];
  patient: Patient | null;
}

async function getConsultation(id: string): Promise<{ consultation: Consultation & { physicalExam: PhysicalExam | null; examResults: ExamResult[] } }> {
  const { data } = await apiClient.get(`/consultations/${id}`);
  return data;
}

async function getConsultationDiagnostics(consultationId: string): Promise<ConsultationDiagnostic[]> {
  const { data } = await apiClient.get<{ consultationDiagnostics: ConsultationDiagnostic[] }>('/consultation-diagnostics', { params: { consultationId } });
  return data.consultationDiagnostics;
}

async function getPsychometricTests(consultationId: string): Promise<PsychometricTestResult[]> {
  const { data } = await apiClient.get<{ psychometricTests: PsychometricTestResult[] }>('/psychometric-tests', { params: { consultationId } });
  return data.psychometricTests;
}

export function useAttendConsultation(consultationId: string) {
  const consultationQ = useQuery({ queryKey: ['consultation', consultationId], queryFn: () => getConsultation(consultationId) });
  const requestsQ = useQuery({ queryKey: ['requests'], queryFn: () => requestsService.getAll() });
  const patientsQ = useQuery({ queryKey: ['patients'], queryFn: () => patientsService.getAll() });
  const diagnosticsQ = useQuery({ queryKey: ['consultation-diagnostics', consultationId], queryFn: () => getConsultationDiagnostics(consultationId) });
  const psychometricQ = useQuery({ queryKey: ['psychometric-tests', consultationId], queryFn: () => getPsychometricTests(consultationId) });

  const isLoading = consultationQ.isLoading || requestsQ.isLoading || patientsQ.isLoading;

  const data: FullConsultation | null = (() => {
    if (!consultationQ.data || !requestsQ.data || !patientsQ.data) return null;
    const c = consultationQ.data.consultation;
    const req = requestsQ.data.requests.find((r) => r.id === c.requestId);
    const patient = req ? patientsQ.data.patients.find((p) => p.cedula === req.patientId) : null;
    return {
      ...c,
      requestDate: req?.requestDate ?? '',
      evaluationReason: (req?.evaluationReason ?? '') as EvaluationReason,
      requestStatus: (req?.status ?? 'Pendiente') as RequestStatus,
      patientId: req?.patientId ?? '',
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : (req?.patientId ?? ''),
      company: patient?.company?.name ?? '',
      position: patient?.position?.name ?? '',
      physicalExam: c.physicalExam ?? null,
      consultationDiagnostics: diagnosticsQ.data ?? [],
      examResults: c.examResults ?? [],
      psychometricTests: psychometricQ.data ?? [],
      patientDiseases: patient?.diseases ?? [],
      patient: patient ?? null,
    };
  })();

  return { data, isLoading, refetch: consultationQ.refetch };
}
