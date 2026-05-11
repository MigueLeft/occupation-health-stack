import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { requestsService } from '@/features/requests/services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { referralsService } from '../services/referrals.service';
import type { Consultation, ConsultationWithDetails, RestPeriod, ConsultationReferral } from '../types';
import type { PhysicalExam, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '../services/sub-entities.service';
import type { EvaluationReason, RequestStatus } from '@/features/requests/types';
import type { Patient } from '@/features/patients/types';

interface PositionRisk { id: string; name: string; type: string; }

interface FullConsultation extends ConsultationWithDetails {
  physicalExam: PhysicalExam | null;
  consultationDiagnostics: ConsultationDiagnostic[];
  examResults: ExamResult[];
  psychometricTests: PsychometricTestResult[];
  patientDiseases: { id: string; name: string }[];
  patient: Patient | null;
  positionRisks: PositionRisk[];
  restPeriod: RestPeriod | null;
  referral: ConsultationReferral | null;
}

async function getConsultation(id: string): Promise<{ consultation: Consultation & { physicalExam: PhysicalExam | null; examResults: ExamResult[]; restPeriod: RestPeriod | null } }> {
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

async function getPositionRisks(positionId: string): Promise<PositionRisk[]> {
  const { data } = await apiClient.get<{ position: { risks: PositionRisk[] } }>(`/positions/${positionId}`);
  return (data.position.risks ?? []).sort((a, b) => a.type.localeCompare(b.type));
}

export function useAttendConsultation(consultationId: string) {
  const consultationQ = useQuery({ queryKey: ['consultation', consultationId], queryFn: () => getConsultation(consultationId) });
  const requestsQ = useQuery({ queryKey: ['requests'], queryFn: () => requestsService.getAll() });
  const patientsQ = useQuery({ queryKey: ['patients'], queryFn: () => patientsService.getAll() });
  const diagnosticsQ = useQuery({ queryKey: ['consultation-diagnostics', consultationId], queryFn: () => getConsultationDiagnostics(consultationId) });
  const psychometricQ = useQuery({ queryKey: ['psychometric-tests', consultationId], queryFn: () => getPsychometricTests(consultationId) });
  const referralQ = useQuery({ queryKey: ['consultation-referral', consultationId], queryFn: () => referralsService.getByConsultation(consultationId) });

  const patient = (() => {
    if (!consultationQ.data || !requestsQ.data || !patientsQ.data) return null;
    const req = requestsQ.data.requests.find((r) => r.id === consultationQ.data!.consultation.requestId);
    return req ? patientsQ.data.patients.find((p) => p.cedula === req.patientId) : null;
  })();

  const positionRisksQ = useQuery({
    queryKey: ['position-risks', patient?.positionId],
    queryFn: () => getPositionRisks(patient!.positionId!),
    enabled: !!patient?.positionId,
  });

  const isLoading = consultationQ.isLoading || requestsQ.isLoading || patientsQ.isLoading || psychometricQ.isLoading || referralQ.isLoading;

  const data: FullConsultation | null = (() => {
    if (!consultationQ.data || !requestsQ.data || !patientsQ.data) return null;
    const c = consultationQ.data.consultation;
    const req = requestsQ.data.requests.find((r) => r.id === c.requestId);
    const pat = req ? patientsQ.data.patients.find((p) => p.cedula === req.patientId) : null;
    return {
      ...c,
      requestDate: req?.requestDate ?? '',
      evaluationReason: (req?.evaluationReason ?? '') as EvaluationReason,
      requestStatus: (req?.status ?? 'Pendiente') as RequestStatus,
      patientId: req?.patientId ?? '',
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : (req?.patientId ?? ''),
      company: pat?.company?.name ?? '',
      position: pat?.position?.name ?? '',
      physicalExam: c.physicalExam ?? null,
      consultationDiagnostics: diagnosticsQ.data ?? [],
      examResults: c.examResults ?? [],
      psychometricTests: psychometricQ.data ?? [],
      patientDiseases: pat?.diseases ?? [],
      patient: pat ?? null,
      positionRisks: (c.status === 'Finalizada' && c.positionRisksSnapshot?.length)
        ? c.positionRisksSnapshot
        : positionRisksQ.data ?? [],
      restPeriod: c.restPeriod ?? null,
      referral: referralQ.data ?? null,
    };
  })();

  return { data, isLoading, isReferralLoading: referralQ.isLoading, isPsychometricFetching: psychometricQ.isFetching, refetchPatient: patientsQ.refetch };
}
