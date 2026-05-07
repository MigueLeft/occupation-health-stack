import { Box, Typography, Stack } from '@mui/material';
import { AppLayout } from '@/components/AppLayout';
import { reportsService, ReportCard } from '@/features/reports';
import { useCompanies } from '@/features/patients';

export function ReportsPage() {
  const { data: companies = [] } = useCompanies();

  return (
    <AppLayout>
      <Box sx={{ p: 4, maxWidth: 860, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>Reportes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Genera documentos PDF con la información del sistema.
        </Typography>

        <Stack spacing={3}>
          <ReportCard
            title="Reporte de Consultas"
            headerColor="#1565C0"
            companies={companies}
            downloadFn={reportsService.downloadConsultationsReport}
            successMsg="Reporte de consultas generado exitosamente."
          />
          <ReportCard
            title="Reporte de Vigilancia Epidemiológica"
            subtitle="Trabajadores por motivo, accidentes, exámenes, reposos, referencias y riesgos"
            headerColor="#6A5ACD"
            companies={companies}
            downloadFn={reportsService.downloadVigilanciaReport}
            successMsg="Reporte de vigilancia generado exitosamente."
          />
          <ReportCard
            title="Reporte de Patologías"
            subtitle="Enfermedades diagnosticadas: casos, días de reposo, distribución por sexo y origen"
            headerColor="#2E7D32"
            companies={companies}
            downloadFn={reportsService.downloadPathologiesReport}
            successMsg="Reporte de patologías generado exitosamente."
          />
          <ReportCard
            title="Reporte de Aparatos y Sistemas"
            subtitle="Sistemas corporales afectados: casos, días de reposo, distribución por sexo y origen"
            headerColor="#E65100"
            companies={companies}
            downloadFn={reportsService.downloadBodySystemsReport}
            successMsg="Reporte de aparatos y sistemas generado exitosamente."
          />
          <ReportCard
            title="Reporte de Morbilidad"
            subtitle="Tipos de solicitud: total, %, aptos/no aptos/condicionados por médico y psicológico"
            headerColor="#00695C"
            companies={companies}
            downloadFn={reportsService.downloadMorbidityReport}
            successMsg="Reporte de morbilidad generado exitosamente."
          />
        </Stack>
      </Box>
    </AppLayout>
  );
}
