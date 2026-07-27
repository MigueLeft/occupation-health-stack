import { apiClient } from '@/lib/axios';

export interface ConsultationReportFilters {
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

export interface PatientHistoryReportFilters {
  cedula: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VigilanciaReportFilters extends ConsultationReportFilters {
  recomendacion1?: string;
  recomendacion2?: string;
  recomendacion3?: string;
  recomendacion4?: string;
  recomendacion5?: string;
}

function cleanBody<T extends object>(filters: T): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  ) as Record<string, string>;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function fetchVigilanciaBlob(filters: VigilanciaReportFilters): Promise<string> {
  const response = await apiClient.post('/reports/vigilancia', cleanBody(filters), {
    responseType: 'blob',
  });
  return URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
}

async function downloadVigilanciaReport(filters: VigilanciaReportFilters): Promise<void> {
  const response = await apiClient.post('/reports/vigilancia', cleanBody(filters), {
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-vigilancia-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadPathologiesReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/pathologies', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-patologias-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadBodySystemsReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/body-systems', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-aparatos-sistemas-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadMorbidityReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/morbidity', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-morbilidad-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadConsolidacionReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/consolidacion', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-consolidacion-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadPsychologicalIndicatorsReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/psychological-indicators', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-indicadores-psicologicos-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadPsychologicalMorbidityReport(filters: ConsultationReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/psychological-morbidity', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-morbilidad-psicologica-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

async function downloadPatientHistoryReport(filters: PatientHistoryReportFilters): Promise<void> {
  const response = await apiClient.get('/reports/patient-history', {
    params: cleanBody(filters),
    responseType: 'blob',
  });
  triggerDownload(
    new Blob([response.data], { type: 'application/pdf' }),
    `reporte-historial-${filters.cedula}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

export const reportsService = {
  fetchVigilanciaBlob,
  downloadVigilanciaReport,
  downloadPathologiesReport,
  downloadBodySystemsReport,
  downloadMorbidityReport,
  downloadConsolidacionReport,
  downloadPsychologicalIndicatorsReport,
  downloadPsychologicalMorbidityReport,
  downloadPatientHistoryReport,
};
