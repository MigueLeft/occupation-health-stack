import { useState } from 'react';
import { Paper, Box, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { toast } from 'sonner';

type DownloadFn = (f: { dateFrom?: string; dateTo?: string; companyId?: string }) => Promise<void>;

export interface ReportCardProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  icon: React.ReactNode;
  downloadFn: DownloadFn;
  successMsg: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

export function ReportCard({
  title, subtitle, accentColor, icon, downloadFn, successMsg,
  dateFrom, dateTo, companyId,
}: ReportCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadFn({ dateFrom, dateTo, companyId });
      toast.success(successMsg);
    } catch {
      toast.error('Error al generar el reporte. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderTop: `3px solid ${accentColor}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              p: 1, borderRadius: 1.5,
              bgcolor: `${accentColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
          </Box>
          <Chip
            label="Disponible"
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.72rem', ml: 1, flexShrink: 0 }}
          />
        </Box>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="small"
          sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor, filter: 'brightness(0.88)' } }}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <FileDownloadOutlined fontSize="small" />}
          onClick={handleDownload}
          disabled={isLoading}
        >
          {isLoading ? 'Generando...' : 'Generar Reporte'}
        </Button>
      </Box>
    </Paper>
  );
}
