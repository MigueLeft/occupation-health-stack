import { apiClient } from '@/lib/axios';

// ─── Physical Exam ────────────────────────────────────────────────────────────
export interface PhysicalExam {
  id: string; consultationId: string;
  systolicPressure?: number | null; diastolicPressure?: number | null;
  heartRate?: number | null; weight?: number | null; height?: number | null;
  respiratoryRate?: number | null; oxygenSaturation?: number | null; notes?: string | null;
}
export type PhysicalExamPayload = Omit<PhysicalExam, 'id' | 'consultationId'>;

export const physicalExamService = {
  create: (p: PhysicalExamPayload & { consultationId: string }) => apiClient.post<{ physicalExam: PhysicalExam }>('/physical-exams', p).then((r) => r.data),
  update: (id: string, p: PhysicalExamPayload) => apiClient.patch<{ physicalExam: PhysicalExam }>(`/physical-exams/${id}`, p).then((r) => r.data),
};

// ─── Consultation Diagnostics ─────────────────────────────────────────────────
export interface ConsultationDiagnostic {
  id: string; consultationId: string; categoryId: string; diseaseId: string; bodySystemId?: string | null;
}
export type DiagnosticPayload = Omit<ConsultationDiagnostic, 'id'>;

export const diagnosticsService = {
  create: (p: DiagnosticPayload) => apiClient.post<{ consultationDiagnostic: ConsultationDiagnostic }>('/consultation-diagnostics', p).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/consultation-diagnostics/${id}`),
};

// ─── Exam Results ─────────────────────────────────────────────────────────────
export interface ExamResult {
  id: string; consultationId: string; examId: string;
  resultValue?: string | null; observation?: string | null; url?: string | null; result?: 'Normal' | 'Anormal' | null;
}
export type ExamResultPayload = Omit<ExamResult, 'id'>;

export const examResultsService = {
  create: (p: ExamResultPayload) => apiClient.post<{ examResult: ExamResult }>('/exam-results', p).then((r) => r.data),
  update: (id: string, p: Partial<ExamResultPayload>) => apiClient.patch<{ examResult: ExamResult }>(`/exam-results/${id}`, p).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/exam-results/${id}`),
};

// ─── Psychometric Tests ───────────────────────────────────────────────────────
export interface PsychometricTestResult {
  id: string; consultationId: string; catalogTestId: string;
  selectedInterpretation?: string | null; observations?: string | null;
}
export type PsychometricPayload = Omit<PsychometricTestResult, 'id'>;

export const psychometricTestsService = {
  create: (p: PsychometricPayload) => apiClient.post<{ psychometricTest: PsychometricTestResult }>('/psychometric-tests', p).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/psychometric-tests/${id}`),
};
