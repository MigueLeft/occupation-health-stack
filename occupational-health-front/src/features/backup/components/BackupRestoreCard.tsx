import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { UploadFileOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBackupRestore } from '../hooks/useBackupRestore';

export function BackupRestoreCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useBackupRestore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    mutate(selectedFile, {
      onSettled: () => {
        setConfirmOpen(false);
        setSelectedFile(null);
      },
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
        <UploadFileOutlined color="warning" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Restaurar Respaldo
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Carga un archivo <code>.pgdump</code> exportado previamente para restaurar la base de datos.
      </Typography>

      <Alert severity="warning" icon={<WarningAmberOutlined fontSize="small" />} sx={{ mb: 2.5 }}>
        Esta operación reemplazará los datos actuales. Asegúrate de tener un respaldo reciente antes de continuar.
      </Alert>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pgdump"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          startIcon={<UploadFileOutlined />}
        >
          Seleccionar archivo
        </Button>
        {selectedFile && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
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
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isPending ? 'Restaurando...' : 'Restaurar base de datos'}
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="¿Restaurar base de datos?"
        message={`Se restaurará desde "${selectedFile?.name}". Todos los datos actuales serán reemplazados. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, restaurar"
        confirmColor="error"
        loading={isPending}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </Paper>
  );
}
