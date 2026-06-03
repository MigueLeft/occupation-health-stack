import { apiClient } from '@/lib/axios';

export interface ReportConfig {
  id: string;
  selloMedico: string | null;
}

export const reportConfigService = {
  get: () =>
    apiClient.get<{ reportConfig: ReportConfig | null }>('/report-config').then((r) => r.data.reportConfig),
  updateSello: (selloMedico: string | null) =>
    apiClient.patch<{ reportConfig: ReportConfig }>('/report-config', { selloMedico }).then((r) => r.data.reportConfig),
};
