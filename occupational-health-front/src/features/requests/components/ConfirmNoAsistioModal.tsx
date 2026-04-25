import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ConfirmNoAsistioModal({ open, onClose, onConfirm, isPending }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        Confirmar acción
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography>
          ¿Está seguro de marcar esta solicitud como{' '}
          <strong>No asistió</strong>? Esta acción cambiará el estatus de la solicitud.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Procesando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
