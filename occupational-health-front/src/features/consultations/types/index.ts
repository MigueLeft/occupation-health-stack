import type { EvaluationReason, RequestStatus } from '@/features/requests/types';
import type { PsychologicalIndicatorResult } from '@/features/psychological-indicators';

export const CONSULTATION_TYPES = ['Medica', 'Psicologica', 'Medica/Psicologica'] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  Medica: 'Médica',
  Psicologica: 'Psicológica',
  'Medica/Psicologica': 'Médica/Psicológica',
};

export const CONSULTATION_STATUSES = ['Pendiente', 'En Proceso', 'Finalizada'] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const CONSULTATION_RESULTS = ['Apto', 'No Apto', 'Apto Condicionado'] as const;
export type ConsultationResult = (typeof CONSULTATION_RESULTS)[number];

export const PSYCHOLOGICAL_RESULTS = ['Completada', 'En Espera', 'Incompleta'] as const;
export type PsychologicalResult = (typeof PSYCHOLOGICAL_RESULTS)[number];

export const PSYCHOLOGICAL_APTITUDES = ['Apto', 'No Apto', 'Apto Condicionado'] as const;
export type PsychologicalAptitude = (typeof PSYCHOLOGICAL_APTITUDES)[number];

export type ConsultationResultUnion = ConsultationResult | PsychologicalResult;

export interface Recommendations {
  suggestedPPE?: string;
  medicalAdequacyMeasures?: string;
  psychologicalAdequacyMeasures?: string;
}

export interface Observations {
  medica?: string;
  psicologica?: string;
  aptitudeDetails?: string;
}

export interface RestPeriod {
  id?: string;
  consultationId?: string;
  requiresRest: boolean;
  days?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  diseaseId?: string | null;
  categoryId?: string | null;
  bodySystemId?: string | null;
}

export interface ConsultationReferral {
  id: string;
  consultationId: string;
  specialtyId: string;
  specialtyName?: string | null;
}

export interface ConsultationDisability {
  id: string;
  consultationId: string;
  disabilityId: string;
}

export interface PositionRiskSnapshot {
  id: string;
  name: string;
  type: string;
}

export interface Consultation {
  id: string;
  requestId: string;
  status: ConsultationStatus;
  // Embedded from backend — populated regardless of requests/patients permissions
  requestDate?: string | null;
  evaluationReason?: EvaluationReason | null;
  patientId?: string | null;
  requestStatus?: RequestStatus | null;
  patientName?: string | null;
  companyName?: string | null;
  positionName?: string | null;
  type: ConsultationType;
  currentTreatment?: string | null;
  interviewConducted?: boolean | null;
  consultationResult?: ConsultationResult | null;
  psychologicalResult?: PsychologicalResult | null;
  psychologicalAptitude?: PsychologicalAptitude | null;
  isHealthy?: boolean | null;
  diagnosisDescription?: string | null;
  recommendations?: Recommendations | null;
  observations?: Observations | null;
  systemAttendedById?: string | null;
  medicalAttendedById?: string | null;
  medicalAttendedByFreeText?: string | null;
  psychologicalAttendedById?: string | null;
  psychologicalAttendedByFreeText?: string | null;
  restPeriod?: RestPeriod | null;
  positionRisksSnapshot?: PositionRiskSnapshot[] | null;
  chronicDiseasesSnapshot?: { id: string; name: string }[] | null;
}

export interface ConsultationWithDetails extends Consultation {
  patientName: string;
  patientId: string;
  requestDate: string;
  evaluationReason: EvaluationReason;
  requestStatus: RequestStatus;
  companyName: string;
  positionName: string;
}

export interface CreateConsultationPayload {
  requestId: string;
  type: string;
  currentTreatment?: string;
  interviewConducted?: boolean;
  consultationResult?: string;
  psychologicalResult?: string;
  psychologicalAptitude?: string;
  isHealthy?: boolean;
  diagnosisDescription?: string;
  recommendations?: Recommendations;
  observations?: Observations;
  systemAttendedById?: string;
  medicalAttendedById?: string;
  medicalAttendedByFreeText?: string;
  psychologicalAttendedById?: string;
  psychologicalAttendedByFreeText?: string;
}

export type UpdateConsultationPayload = Omit<CreateConsultationPayload, 'requestId' | 'type'> & {
  status?: ConsultationStatus;
  type?: ConsultationType;
  chronicDiseasesSnapshot?: { id: string; name: string }[];
  psychologicalIndicatorResults?: PsychologicalIndicatorResult[];
};
