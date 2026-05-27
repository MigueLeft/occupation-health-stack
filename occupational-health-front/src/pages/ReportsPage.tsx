import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Stack, TextField, MenuItem, Autocomplete } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  BarChartOutlined, CoronavirusOutlined, AccessibilityNewOutlined,
  TrendingUpOutlined, SummarizeOutlined,
} from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { reportsService } from '@/features/reports';
import { ReportCard } from '@/features/reports/components/ReportCard';
import {
  type PeriodType, computeDateRange,
  YEAR_OPTIONS, MONTH_OPTIONS, QUARTER_OPTIONS, SEMESTER_OPTIONS,
} from '@/features/reports/utils/period-dates';
import { useCompanies } from '@/features/patients';

interface PeriodState {
  periodType: PeriodType;
  year: string;
  month: string;
  quarter: string;
  semester: string;
}

const DEFAULT_PERIOD: PeriodState = { periodType: 'none', year: '', month: '', quarter: '', semester: '' };

export function ReportsPage() {
  usePageTitle('Reportes');

  const { data: companies = [] } = useCompanies();
  const [filters, setFilters] = useState({ from: '', to: '', company: '' });
  const [period, setPeriod] = useState<PeriodState>(DEFAULT_PERIOD);
  const isPresetActive = period.periodType !== 'none';

  useEffect(() => {
    const range = computeDateRange(period.periodType, period.year, period.month, period.quarter, period.semester);
    if (range) {
      setFilters((p) => ({ ...p, from: range.from, to: range.to }));
    } else if (isPresetActive) {
      setFilters((p) => ({ ...p, from: '', to: '' }));
    }
  }, [period, isPresetActive]);

  const sharedFilters = {
    dateFrom: filters.from || undefined,
    dateTo: filters.to || undefined,
    companyId: filters.company || undefined,
  };

  return (
    <AppLayout>
      <Box sx={{ px: 4, pt: 3, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3, mb: 2.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Reportes Epidemiológicos</Typography>
            <Typography variant="body2" color="text.secondary">
              Genera y descarga los reportes del sistema de vigilancia médica ocupacional
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            select label="Período" size="small" sx={{ minWidth: 165 }}
            value={period.periodType}
            onChange={(e) => setPeriod({ ...DEFAULT_PERIOD, periodType: e.target.value as PeriodType })}
          >
            <MenuItem value="none">Personalizado</MenuItem>
            <MenuItem value="monthly">Mensual</MenuItem>
            <MenuItem value="quarterly">Trimestral</MenuItem>
            <MenuItem value="semiannual">Semestral</MenuItem>
            <MenuItem value="annual">Anual</MenuItem>
          </TextField>

          {period.periodType === 'monthly' && (
            <Stack direction="row" spacing={1.5} useFlexGap>
              <TextField select label="Mes" size="small" sx={{ minWidth: 130 }} value={period.month}
                onChange={(e) => {
                  const month = e.target.value;
                  setPeriod((p) => ({ ...p, month, year: p.year || String(new Date().getFullYear()) }));
                }}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {MONTH_OPTIONS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </TextField>
              <TextField select label="Año" size="small" sx={{ minWidth: 100 }} value={period.year}
                onChange={(e) => setPeriod((p) => ({ ...p, year: e.target.value }))}
              >
                <MenuItem value=""><em>Año</em></MenuItem>
                {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Stack>
          )}

          {period.periodType === 'quarterly' && (
            <Stack direction="row" spacing={1.5} useFlexGap>
              <TextField select label="Trimestre" size="small" sx={{ minWidth: 210 }} value={period.quarter}
                onChange={(e) => setPeriod((p) => ({ ...p, quarter: e.target.value }))}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {QUARTER_OPTIONS.map((q) => <MenuItem key={q.value} value={q.value}>{q.label}</MenuItem>)}
              </TextField>
              <TextField select label="Año" size="small" sx={{ minWidth: 100 }} value={period.year}
                onChange={(e) => setPeriod((p) => ({ ...p, year: e.target.value }))}
              >
                <MenuItem value=""><em>Año</em></MenuItem>
                {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Stack>
          )}

          {period.periodType === 'semiannual' && (
            <Stack direction="row" spacing={1.5} useFlexGap>
              <TextField select label="Semestre" size="small" sx={{ minWidth: 210 }} value={period.semester}
                onChange={(e) => setPeriod((p) => ({ ...p, semester: e.target.value }))}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {SEMESTER_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
              <TextField select label="Año" size="small" sx={{ minWidth: 100 }} value={period.year}
                onChange={(e) => setPeriod((p) => ({ ...p, year: e.target.value }))}
              >
                <MenuItem value=""><em>Año</em></MenuItem>
                {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Stack>
          )}

          {period.periodType === 'annual' && (
            <TextField select label="Año" size="small" sx={{ minWidth: 100 }} value={period.year}
              onChange={(e) => setPeriod((p) => ({ ...p, year: e.target.value }))}
            >
              <MenuItem value=""><em>Año</em></MenuItem>
              {YEAR_OPTIONS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          )}

          {!isPresetActive && (
            <Stack direction="row" spacing={1.5} useFlexGap>
              <TextField
                label="Fecha desde" type="date" size="small" sx={{ minWidth: 155 }}
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Fecha hasta" type="date" size="small" sx={{ minWidth: 155 }}
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          )}

          <Autocomplete
            options={companies} getOptionLabel={(c) => c.name}
            value={companies.find((c) => c.id === filters.company) ?? null}
            onChange={(_, company) => setFilters((p) => ({ ...p, company: company?.id ?? '' }))}
            size="small" sx={{ minWidth: 240 }}
            renderInput={(params) => <TextField {...params} label="Empresa (todas si no se selecciona)" />}
          />
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={6}>
            <ReportCard
              title="Vigilancia Epidemiológica"
              subtitle="Análisis de la distribución y frecuencia de enfermedades ocupacionales. Incluye tasas de incidencia, prevalencia y tendencias por período."
              accentColor="#6A5ACD"
              icon={<BarChartOutlined sx={{ color: '#6A5ACD', fontSize: 22 }} />}
              downloadFn={reportsService.downloadVigilanciaReport}
              successMsg="Reporte de vigilancia generado exitosamente."
              {...sharedFilters}
            />
          </Grid>
          <Grid size={6}>
            <ReportCard
              title="Reporte de Patologías"
              subtitle="Clasificación y frecuencia de patologías diagnosticadas por grupo diagnóstico CIE-10. Comparativo por empresa, área y período."
              accentColor="#C62828"
              icon={<CoronavirusOutlined sx={{ color: '#C62828', fontSize: 22 }} />}
              downloadFn={reportsService.downloadPathologiesReport}
              successMsg="Reporte de patologías generado exitosamente."
              {...sharedFilters}
            />
          </Grid>
          <Grid size={6}>
            <ReportCard
              title="Reporte de Aparatos/Sistemas"
              subtitle="Distribución de hallazgos clínicos organizados por aparato o sistema anatómico. Útil para análisis de riesgo por puesto de trabajo."
              accentColor="#1565C0"
              icon={<AccessibilityNewOutlined sx={{ color: '#1565C0', fontSize: 22 }} />}
              downloadFn={reportsService.downloadBodySystemsReport}
              successMsg="Reporte de aparatos y sistemas generado exitosamente."
              {...sharedFilters}
            />
          </Grid>
          <Grid size={6}>
            <ReportCard
              title="Reporte de Morbilidad"
              subtitle="Índices de morbilidad laboral por empresa, cargo y período. Incluye ausentismo, días perdidos y causas de ausentismo médico."
              accentColor="#E65100"
              icon={<TrendingUpOutlined sx={{ color: '#E65100', fontSize: 22 }} />}
              downloadFn={reportsService.downloadMorbidityReport}
              successMsg="Reporte de morbilidad generado exitosamente."
              {...sharedFilters}
            />
          </Grid>
          <Grid size={12}>
            <ReportCard
              title="Consolidación Epidemiológica"
              subtitle="Reporte consolidado de todos los indicadores epidemiológicos del período seleccionado. Integra vigilancia, morbilidad, patologías y datos por aparato/sistema en un único informe ejecutivo para la dirección médica y organismos regulatorios."
              accentColor="#2E7D32"
              icon={<SummarizeOutlined sx={{ color: '#2E7D32', fontSize: 22 }} />}
              downloadFn={reportsService.downloadConsolidacionReport}
              successMsg="Reporte de consolidación epidemiológica generado exitosamente."
              {...sharedFilters}
            />
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
