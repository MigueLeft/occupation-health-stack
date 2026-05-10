import { apiClient } from '@/lib/axios';

export interface ConsultationReportFilters {
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

async function downloadVigilanciaReport(filters: ConsultationReportFilters): Promise<void> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );

  const response = await apiClient.get('/reports/vigilancia', {
    params,
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-vigilancia-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadPathologiesReport(filters: ConsultationReportFilters): Promise<void> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/reports/pathologies', { params, responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-patologias-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadBodySystemsReport(filters: ConsultationReportFilters): Promise<void> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/reports/body-systems', { params, responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-aparatos-sistemas-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadMorbidityReport(filters: ConsultationReportFilters): Promise<void> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/reports/morbidity', { params, responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-morbilidad-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const reportsService = {
  downloadVigilanciaReport,
  downloadPathologiesReport,
  downloadBodySystemsReport,
  downloadMorbidityReport,
};
