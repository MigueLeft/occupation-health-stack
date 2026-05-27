import { Paper, Stack, Typography, Button, CircularProgress } from '@mui/material';
import { CloudDownloadOutlined } from '@mui/icons-material';
import { useBackupExport } from '../hooks/useBackupExport';

export function BackupExportCard() {
  const { mutate, isPending } = useBackupExport();

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
        <CloudDownloadOutlined color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Exportar Respaldo
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Genera y descarga un archivo <code>.pgdump</code> con todos los datos actuales de la base de datos.
      </Typography>

      <Button
        variant="contained"
        onClick={() => mutate()}
        disabled={isPending}
        startIcon={
          isPending ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadOutlined />
        }
      >
        {isPending ? 'Generando respaldo...' : 'Descargar respaldo'}
      </Button>
    </Paper>
  );
}
