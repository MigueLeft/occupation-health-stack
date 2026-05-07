import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';

interface Props {
  open: boolean;
  emptySection: 'medica' | 'psicologica';
  isSaving: boolean;
  onFinalize: () => void;
  onSavePartial: () => void;
  onCancel: () => void;
}

const LABELS: Record<'medica' | 'psicologica', string> = {
  medica: 'médica',
  psicologica: 'psicológica',
};

export function SavePartialModal({ open, emptySection, isSaving, onFinalize, onSavePartial, onCancel }: Props) {
  const emptyLabel = LABELS[emptySection];
  const filledLabel = emptySection === 'medica' ? 'psicológica' : 'médica';

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlined color="warning" fontSize="small" />
        Sección incompleta
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2">
          La sección <strong>{emptyLabel}</strong> está vacía. ¿Cómo deseas continuar?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            disabled={isSaving}
            onClick={onFinalize}
          >
            Finalizar sin sección {emptyLabel}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            disabled={isSaving}
            onClick={onSavePartial}
          >
            Guardar solo sección {filledLabel}
          </Button>
          <Button
            variant="text"
            fullWidth
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
