import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { CloudDownloadOutlined, UploadFileOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { apiClient } from '@/lib/axios';

async function downloadBackup(): Promise<void> {
  const response = await apiClient.get('/backup/export', { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/octet-stream' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${new Date().toISOString().slice(0, 10)}.sql`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function uploadRestore(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await apiClient.post('/backup/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function BackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadBackup();
      toast.success('Respaldo descargado exitosamente.');
    } catch {
      toast.error('Error al generar el respaldo.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    e.target.value = '';
  };

  const handleRestoreConfirm = async () => {
    if (!selectedFile) return;
    setRestoring(true);
    setConfirmOpen(false);
    try {
      await uploadRestore(selectedFile);
      toast.success('Base de datos restaurada exitosamente.');
      setSelectedFile(null);
    } catch {
      toast.error('Error al restaurar la base de datos. Verifica que el archivo sea válido.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <AppLayout>
      <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          Respaldo de Base de Datos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Exporta un respaldo completo o restaura desde un archivo SQL previamente generado.
        </Typography>

        <Stack spacing={3}>
          {/* Exportar */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
              <CloudDownloadOutlined color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Exportar Respaldo
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Genera y descarga un archivo <code>.sql</code> con todos los datos actuales de la base de datos.
            </Typography>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadOutlined />}
            >
              {exporting ? 'Generando respaldo...' : 'Descargar respaldo'}
            </Button>
          </Paper>

          <Divider />

          {/* Restaurar */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
              <UploadFileOutlined color="warning" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Restaurar Respaldo
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Carga un archivo <code>.sql</code> exportado previamente para restaurar la base de datos.
            </Typography>

            <Alert
              severity="warning"
              icon={<WarningAmberOutlined fontSize="small" />}
              sx={{ mb: 2.5 }}
            >
              Esta operación reemplazará los datos actuales. Asegúrate de tener un respaldo reciente antes de continuar.
            </Alert>

            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                startIcon={<UploadFileOutlined />}
              >
                Seleccionar archivo
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </Typography>
              )}
            </Stack>

            {selectedFile && (
              <Button
                variant="contained"
                color="warning"
                sx={{ mt: 2 }}
                onClick={() => setConfirmOpen(true)}
                disabled={restoring}
                startIcon={restoring ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                {restoring ? 'Restaurando...' : 'Restaurar base de datos'}
              </Button>
            )}
          </Paper>
        </Stack>

        <ConfirmDialog
          open={confirmOpen}
          title="¿Restaurar base de datos?"
          message={`Se restaurará desde "${selectedFile?.name}". Todos los datos actuales serán reemplazados. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, restaurar"
          confirmColor="error"
          onConfirm={handleRestoreConfirm}
          onClose={() => setConfirmOpen(false)}
        />
      </Box>
    </AppLayout>
  );
}
