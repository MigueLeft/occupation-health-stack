import { useState, useEffect } from 'react';
import { Paper, Box, Typography, Divider, Button, CircularProgress } from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import { toast } from 'sonner';
import { computeDateRange } from '../utils/period-dates';
import { ReportFilters } from './ReportFilters';
import { type PeriodState } from './PeriodPresetSelector';

type DownloadFn = (f: { dateFrom?: string; dateTo?: string; companyId?: string }) => Promise<void>;

interface FilterState { from: string; to: string; company: string; }

const DEFAULT_PERIOD: PeriodState = {
  periodType: 'none', year: '', month: '', quarter: '', semester: '',
};

export interface ReportCardProps {
  title: string;
  subtitle?: string;
  headerColor: string;
  companies: { id: string; name: string }[];
  downloadFn: DownloadFn;
  successMsg: string;
}

export function ReportCard({ title, subtitle, headerColor, companies, downloadFn, successMsg }: ReportCardProps) {
  const [filters, setFilters] = useState<FilterState>({ from: '', to: '', company: '' });
  const [period, setPeriod] = useState<PeriodState>(DEFAULT_PERIOD);
  const [isLoading, setIsLoading] = useState(false);

  const isPresetActive = period.periodType !== 'none';

  useEffect(() => {
    const range = computeDateRange(period.periodType, period.year, period.month, period.quarter, period.semester);
    if (range) {
      setFilters((p) => ({ ...p, from: range.from, to: range.to }));
    } else if (isPresetActive) {
      setFilters((p) => ({ ...p, from: '', to: '' }));
    }
  }, [period, isPresetActive]);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadFn({
        dateFrom: filters.from || undefined,
        dateTo: filters.to || undefined,
        companyId: filters.company || undefined,
      });
      toast.success(successMsg);
    } catch {
      toast.error('Error al generar el reporte. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, bgcolor: headerColor, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <PictureAsPdfOutlined sx={{ color: 'white', fontSize: 22 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{subtitle}</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <ReportFilters
          dateFrom={filters.from} dateTo={filters.to} companyId={filters.company}
          companies={companies} period={period} isPresetActive={isPresetActive}
          onDateFromChange={(v) => setFilters((p) => ({ ...p, from: v }))}
          onDateToChange={(v) => setFilters((p) => ({ ...p, to: v }))}
          onCompanyChange={(v) => setFilters((p) => ({ ...p, company: v }))}
          onPeriodChange={(updates) => setPeriod((p) => ({ ...p, ...updates }))}
        />
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{ minWidth: 180, bgcolor: headerColor, '&:hover': { bgcolor: headerColor, filter: 'brightness(0.9)' } }}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlined />}
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
