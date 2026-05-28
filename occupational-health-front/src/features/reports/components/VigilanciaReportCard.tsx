import { useState } from 'react';
import { Paper, Box, Typography, Button, Chip } from '@mui/material';
import { BarChartOutlined, PreviewOutlined } from '@mui/icons-material';
import { VigilanciaReportDialog } from './VigilanciaReportDialog';

interface Props {
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

const ACCENT = '#6A5ACD';

export function VigilanciaReportCard({ dateFrom, dateTo, companyId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderTop: `3px solid ${ACCENT}`,
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
                bgcolor: `${ACCENT}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BarChartOutlined sx={{ color: ACCENT, fontSize: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                Vigilancia Epidemiológica
              </Typography>
            </Box>
            <Chip
              label="Disponible"
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.72rem', ml: 1, flexShrink: 0 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Análisis de la distribución y frecuencia de enfermedades ocupacionales. Incluye tasas de incidencia,
            prevalencia y tendencias por período. Permite agregar medidas de control antes de generar el reporte.
          </Typography>
        </Box>

        <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT, filter: 'brightness(0.88)' } }}
            startIcon={<PreviewOutlined fontSize="small" />}
            onClick={() => setOpen(true)}
          >
            Configurar y Generar
          </Button>
        </Box>
      </Paper>

      <VigilanciaReportDialog
        open={open}
        onClose={() => setOpen(false)}
        filters={{ dateFrom, dateTo, companyId }}
      />
    </>
  );
}
