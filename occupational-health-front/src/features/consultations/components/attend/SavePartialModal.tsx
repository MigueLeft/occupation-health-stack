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

export function SavePartialModal({ open, emptySection, isSaving, onFinalize, onSavePartial, onCancel }: Props) {
  const isMedicalEmpty = emptySection === 'medica';
  const filledLabel = isMedicalEmpty ? 'psicológica' : 'médica';
  const emptyLabel = isMedicalEmpty ? 'médica' : 'psicológica';

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlined color="warning" fontSize="small" />
        Sección {emptyLabel} vacía
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2">
          La sección <strong>{emptyLabel}</strong> no contiene información. ¿Cómo deseas continuar?
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
            Finalizar con sección {filledLabel}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            disabled={isSaving}
            onClick={onSavePartial}
          >
            Guardar sección {filledLabel} y mantener en proceso
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
