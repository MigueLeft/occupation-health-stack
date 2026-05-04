import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Autocomplete, Stack, Divider, CircularProgress,
} from '@mui/material';
import { PictureAsPdfOutlined, FilterAltOutlined } from '@mui/icons-material';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { reportsService } from '@/features/reports';
import { useCompanies } from '@/features/patients';

export function ReportsPage() {
  const { data: companies = [] } = useCompanies();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await reportsService.downloadConsultationsReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        companyId: companyId || undefined,
      });
      toast.success('Reporte generado exitosamente.');
    } catch {
      toast.error('Error al generar el reporte. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <Box sx={{ p: 4, maxWidth: 860, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          Reportes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Genera documentos PDF con la información del sistema.
        </Typography>

        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Card header */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PictureAsPdfOutlined sx={{ color: 'white', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
              Reporte de Consultas
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterAltOutlined fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Filtros (opcionales)
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Fecha desde"
                  type="date"
                  size="small"
                  fullWidth
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Fecha hasta"
                  type="date"
                  size="small"
                  fullWidth
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>

              <Autocomplete
                options={companies}
                getOptionLabel={(c) => c.name}
                value={companies.find((c) => c.id === companyId) ?? null}
                onChange={(_, company) => setCompanyId(company?.id ?? '')}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Empresa (todas si no se selecciona)" />
                )}
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlined />}
                onClick={handleDownload}
                disabled={isLoading}
                sx={{ minWidth: 180 }}
              >
                {isLoading ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </AppLayout>
  );
}
