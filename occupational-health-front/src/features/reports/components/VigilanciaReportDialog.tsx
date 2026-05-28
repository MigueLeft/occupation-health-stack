import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, CircularProgress,
  Divider, Stack,
} from '@mui/material';
import { FileDownloadOutlined, PreviewOutlined, CloseOutlined } from '@mui/icons-material';
import { toast } from 'sonner';
import { reportsService, type VigilanciaReportFilters } from '../services/reports.service';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Omit<VigilanciaReportFilters, 'recomendacion1' | 'recomendacion2' | 'recomendacion3' | 'recomendacion4' | 'recomendacion5'>;
}

const MEDIDAS = [
  { key: 'recomendacion1' as const, label: '1. En la Fuente' },
  { key: 'recomendacion2' as const, label: '2. En el Ambiente' },
  { key: 'recomendacion3' as const, label: '3. En los Trabajadores' },
  { key: 'recomendacion4' as const, label: '4. En lo Administrativo' },
  { key: 'recomendacion5' as const, label: '5. En lo Psicológico' },
];

export function VigilanciaReportDialog({ open, onClose, filters }: Props) {
  const [recs, setRecs] = useState({ recomendacion1: '', recomendacion2: '', recomendacion3: '', recomendacion4: '', recomendacion5: '' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Revoke previous blob URL on unmount / new preview
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const buildFilters = (): VigilanciaReportFilters => ({ ...filters, ...recs });

  const handlePreview = async () => {
    setPreviewing(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    try {
      const url = await reportsService.fetchVigilanciaBlob(buildFilters());
      setPreviewUrl(url);
    } catch {
      toast.error('Error al generar la previsualización.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await reportsService.downloadVigilanciaReport(buildFilters());
      toast.success('Reporte de vigilancia generado exitosamente.');
    } catch {
      toast.error('Error al descargar el reporte.');
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth slotProps={{ paper: { sx: { height: '90vh' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Vigilancia Epidemiológica</Typography>
        <Button size="small" onClick={handleClose} sx={{ minWidth: 0 }}><CloseOutlined /></Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel: recommendations */}
        <Box sx={{ width: 340, flexShrink: 0, p: 2.5, overflowY: 'auto', borderRight: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            VIII. Medidas de Control
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            En la fuente y los trabajadores (opcional)
          </Typography>
          <Stack spacing={2}>
            {MEDIDAS.map(({ key, label }) => (
              <TextField
                key={key}
                label={label}
                multiline
                rows={3}
                size="small"
                fullWidth
                value={recs[key]}
                onChange={(e) => setRecs((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="Escribe la recomendación aquí..."
              />
            ))}
          </Stack>
        </Box>

        {/* Right panel: PDF preview */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#F5F5F5' }}>
          {previewUrl ? (
            <iframe src={previewUrl} style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} title="Previsualización del reporte" />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: 'text.secondary' }}>
              <PreviewOutlined sx={{ fontSize: 56, opacity: 0.3 }} />
              <Typography variant="body2">Haz clic en "Previsualizar" para ver el reporte</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={previewing ? <CircularProgress size={14} /> : <PreviewOutlined fontSize="small" />}
          onClick={handlePreview} disabled={previewing || downloading}>
          {previewing ? 'Cargando...' : 'Previsualizar'}
        </Button>
        <Button variant="contained" size="small" startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <FileDownloadOutlined fontSize="small" />}
          sx={{ bgcolor: '#6A5ACD', '&:hover': { bgcolor: '#6A5ACD', filter: 'brightness(0.88)' } }}
          onClick={handleDownload} disabled={previewing || downloading}>
          {downloading ? 'Generando...' : 'Descargar Reporte'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
