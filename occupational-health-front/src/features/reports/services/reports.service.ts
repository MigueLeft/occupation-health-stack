import { apiClient } from '@/lib/axios';

export interface ConsultationReportFilters {
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

async function downloadConsultationsReport(filters: ConsultationReportFilters): Promise<void> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );

  const response = await apiClient.get('/reports/consultations', {
    params,
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-consultas-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const reportsService = { downloadConsultationsReport };
